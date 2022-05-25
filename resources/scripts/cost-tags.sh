#!/bin/bash

# MIT No Attribution
# Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
# Permission is hereby granted, free of charge, to any person obtaining a copy of this
# software and associated documentation files (the "Software"), to deal in the Software
# without restriction, including without limitation the rights to use, copy, modify,
# merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
# permit persons to whom the Software is furnished to do so.
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
# INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
# PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
# HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
# OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
# SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


source "/etc/parallelcluster/cfnconfig"

if [ "${cfn_node_type}" == "ComputeFleet" ];then

  # Create the folder used to save jobs information

  mkdir /tmp/jobs

  # Configure the script to run every minute
  echo "
* * * * * /opt/slurm/sbin/check_tags.sh
" | crontab -
  exit 0
else

  # Cron script used to update the instance tags

  cat <<'EOF' > /opt/slurm/sbin/check_tags.sh
#!/bin/bash

source /etc/profile

region=$(curl -s http://169.254.169.254/latest/meta-data/placement/region)
aws configure set region $region

update=0
tag_userid=""
tag_jobid=""
tag_project=""

if [ ! -f /tmp/jobs/jobs_users ] || [ ! -f /tmp/jobs/jobs_ids ]; then
  exit 0
fi

active_users=$(cat /tmp/jobs/jobs_users | sort | uniq )
active_jobs=$(cat /tmp/jobs/jobs_ids | sort )
echo $active_users > /tmp/jobs/tmp_jobs_users
echo $active_jobs > /tmp/jobs/tmp_jobs_ids
if [ -f /tmp/jobs/jobs_projects ]; then
  active_projects=$(cat /tmp/jobs/jobs_projects | sort | uniq )
  echo $active_projects > /tmp/jobs/tmp_jobs_projects
fi


if [ ! -f /tmp/jobs/tag_userid ] || [ ! -f /tmp/jobs/tag_jobid ]; then

  echo $active_users > /tmp/jobs/tag_userid
  echo $active_jobs > /tmp/jobs/tag_jobid
  echo $active_projects > /tmp/jobs/tag_project
  update=1

else

  active_users=$(cat /tmp/jobs/tmp_jobs_users)
  active_jobs=$(cat /tmp/jobs/tmp_jobs_ids)
  if [ -f /tmp/jobs/tmp_jobs_projects ]; then
    active_projects=$(cat /tmp/jobs/tmp_jobs_projects)
  fi 
  tag_userid=$(cat /tmp/jobs/tag_userid)
  tag_jobid=$(cat /tmp/jobs/tag_jobid)
  if [ -f /tmp/jobs/tag_project ]; then
    tag_project=$(cat /tmp/jobs/tag_project)
  fi
  
  if [ "${active_users}" != "${tag_userid}" ]; then
    tag_userid="${active_users}"
    echo ${tag_userid} > /tmp/jobs/tag_userid
    update=1
  fi
  
  if [ "${active_jobs}" != "${tag_jobid}" ]; then
    tag_jobid="${active_jobs}"
    echo ${tag_jobid} > /tmp/jobs/tag_jobid
    update=1
  fi
  
  if [ "${active_projects}" != "${tag_project}" ]; then
    tag_project="${active_projects}"
    echo ${tag_project} > /tmp/jobs/tag_project
    update=1
  fi

fi

if [ ${update} -eq 1 ]; then
  
  # Instance ID
  MyInstID=$(curl -s http://169.254.169.254/latest/meta-data/instance-id)
  tag_userid=$(cat /tmp/jobs/tag_userid)
  tag_jobid=$(cat /tmp/jobs/tag_jobid)
  tag_project=$(cat /tmp/jobs/tag_project)
  aws ec2 create-tags --resources ${MyInstID} --tags Key=aws-parallelcluster-username,Value="${tag_userid}"
  aws ec2 create-tags --resources ${MyInstID} --tags Key=aws-parallelcluster-jobid,Value="${tag_jobid}"
  aws ec2 create-tags --resources ${MyInstID} --tags Key=aws-parallelcluster-project,Value="${tag_project}"
  
fi


EOF

   chmod +x /opt/slurm/sbin/check_tags.sh
   
   # Create Prolog and Epilog to tag the instances
   cat <<'EOF' > /opt/slurm/sbin/prolog.sh
#!/bin/bash

#slurm directory
export SLURM_ROOT=/opt/slurm
echo "${SLURM_JOB_USER}" >> /tmp/jobs/jobs_users
echo "${SLURM_JOBID}" >> /tmp/jobs/jobs_ids

#load the comment of the job.
Project=$($SLURM_ROOT/bin/scontrol show job ${SLURM_JOB_ID} | grep Comment | awk -F'=' '{print $2}')
Project_Tag=""
if [ ! -z "${Project}" ];then
  echo "${Project}" >> /tmp/jobs/jobs_projects
fi

EOF

    cat <<'EOF' > /opt/slurm/sbin/epilog.sh
#!/bin/bash
#slurm directory
export SLURM_ROOT=/opt/slurm
sed -i "0,/${SLURM_JOB_USER}/d" /tmp/jobs/jobs_users
sed -i "0,/${SLURM_JOBID}/d" /tmp/jobs/jobs_ids

#load the comment of the job.
Project=$($SLURM_ROOT/bin/scontrol show job ${SLURM_JOB_ID} | grep Comment | awk -F'=' '{print $2}')
Project_Tag=""
if [ ! -z "${Project}" ];then
  sed -i "0,/${Project}/d" /tmp/jobs/jobs_projects
fi

EOF


    chmod +x /opt/slurm/sbin/prolog.sh
    chmod +x /opt/slurm/sbin/epilog.sh

    # Configure slurm to use Prolog and Epilog
    echo "PrologFlags=Alloc" >> /opt/slurm/etc/slurm.conf
    echo "Prolog=/opt/slurm/sbin/prolog.sh" >> /opt/slurm/etc/slurm.conf
    echo "Epilog=/opt/slurm/sbin/epilog.sh" >> /opt/slurm/etc/slurm.conf

    # Configure sbatch wrapper
    mv /opt/slurm/bin/sbatch /opt/slurm/sbin/sbatch

    wget -O /opt/slurm/bin/sbatch https://raw.githubusercontent.com/aws-samples/pcluster-manager/main/resources/scripts/sbatch
    chmod +x /opt/slurm/bin/sbatch

    mv /opt/slurm/bin/srun /opt/slurm/sbin/srun
    ln -s /opt/slurm/bin/sbatch /opt/slurm/bin/srun

    # Configure default project_list.conf
    cat <<'EOF' > /opt/slurm/etc/projects_list.conf
ec2-user=ProjectA, ProjectB
userA=ProjectA, ProjectC
EOF

    systemctl restart slurmctld

fi
