#!/bin/bash
#Description: Install Spack on ParallelCluster spack.sh [/shared_dir]

source /opt/parallelcluster/cfnconfig
export USER=$cfn_cluster_user
export SPACK_ROOT=${1}


mkdir -p $SPACK_ROOT
git clone -c feature.manyFiles=true https://github.com/spack/spack $SPACK_ROOT
cd $SPACK_ROOT

echo "export SPACK_ROOT=$SPACK" >> /home/$USER/.bashrc
echo "source \$SPACK_ROOT/share/spack/setup-env.sh" >> /home/$USER/.bashrc
