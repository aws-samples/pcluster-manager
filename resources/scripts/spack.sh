#!/bin/bash
#Description: Install Spack on ParallelCluster spack.sh [/shared_dir]

export USER=$cfn_cluster_user
export SPACK_ROOT=${1}

echo spack_root: -${SPACK_ROOT}-
echo user: $USER

mkdir -p $SPACK_ROOT
git clone -c feature.manyFiles=true https://github.com/spack/spack $SPACK_ROOT
cd $SPACK_ROOT

ls /home

echo "export SPACK_ROOT=$SPACK_ROOT" >> /home/$USER/.bashrc
echo "source \$SPACK_ROOT/share/spack/setup-env.sh" >> /home/$USER/.bashrc
