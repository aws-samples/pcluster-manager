#!/bin/bash
#Description: Install Spack on ParallelCluster spack.sh [/shared_dir] [release-tag] [/user/install/path]

# Defaults to ec2-user if not on ParallelCluster
export USER=${cfn_cluster_user:-ec2-user}

# Defaults to /shared/spack if argv1 not set
# Spack repo is installed here with sudo/root control over packages that are global.
# Users will each have an independent install_tree in their $HOME/.spack folder.
# Packages installed to $SPACK_ROOT (i.e., --scope site) are shared by all users.
export SPACK_ROOT=${1:-/shared/spack}
export SPACK_RELEASE=${2:-develop}

# argv3 can override where user-controlled packages are installed
# If not ~/.spack then permissions need to be opened for all users to read/write
# Does not support variables in arg (i.e., NO support for "/shared/$USER")
export USER_SPACK_ROOT=${3:-\~/.spack}
echo ${USER_SPACK_ROOT}
mkdir -p $USER_SPACK_ROOT
chown $USER: $USER_SPACK_ROOT

mkdir -p $SPACK_ROOT
git clone -c feature.manyFiles=true https://github.com/spack/spack -b $SPACK_RELEASE $SPACK_ROOT
cd $SPACK_ROOT

echo "export SPACK_ROOT=$SPACK_ROOT" >> /root/.bashrc
echo "source \$SPACK_ROOT/share/spack/setup-env.sh" >> /root/.bashrc

echo "export SPACK_ROOT=$SPACK_ROOT" >> /home/$USER/.bashrc
echo "source \$SPACK_ROOT/share/spack/setup-env.sh" >> /home/$USER/.bashrc

# Activate spack for some quick configuration
source ${SPACK_ROOT}/share/spack/setup-env.sh

# Find gcc and other compilers on PATH
spack compiler find --scope site

# Improve usability of spack for Tcl Modules
spack config --scope site add "modules:default:tcl:all:autoload: direct"
spack config --scope site add "modules:default:tcl:verbose: True"
spack config --scope site add "modules:default:tcl:hash_length: 6"
spack config --scope site add "modules:default:tcl:projections:all: '{name}/{version}-{compiler.name}-{compiler.version}'"
spack config --scope site add "modules:default:tcl:projections:^mpi: '{name}/{version}-{^mpi.name}-{^mpi.version}-{compiler.name}-{compiler.version}'"
spack config --scope site add "modules:default:tcl:all:conflict: ['{name}']"
spack config --scope site add "modules:default:tcl:all:suffixes:^cuda: cuda"
spack config --scope site add "modules:default:tcl:all:environment:set:{name}_ROOT: '{prefix}'"
spack module tcl refresh --delete-tree -y

# Root retains control of upstream packages
#cat ${SPACK_ROOT}/etc/spack/defaults/config.yaml > /root/.spack/config.yaml
mkdir -p /root/.spack
spack config get config > /root/.spack/config.yaml
spack config --scope user add "config:install_tree:root:${SPACK_ROOT}/opt/spack"
spack config --scope user add "config:module_roots:tcl:${SPACK_ROOT}/share/spack/modules"
spack config --scope user add "config:module_roots:lmod:${SPACK_ROOT}/share/spack/lmod"

# (Required) Install a light package to initialize upstream database
spack install -y patchelf

# Users control packages local to their account
spack config --scope site add "config:install_tree:root:${USER_SPACK_ROOT}/install"
spack config --scope site add "config:module_roots:tcl:${USER_SPACK_ROOT}/modules"
spack config --scope site add "config:module_roots:lmod:${USER_SPACK_ROOT}/lmod"
spack config --scope site add "config:source_cache:${USER_SPACK_ROOT}/cache"
spack config --scope site add "config:template_dirs: [${USER_SPACK_ROOT}/templates]"
# BUG: build_stage default does not have valid type
# spack config --scope site add "config:build_stage: [${USER_SPACK_ROOT}/stage]"
cat << EOF >> $(spack config --scope site edit config --print-file)
  build_stage:
    - ${USER_SPACK_ROOT}/stage
EOF

# Root-controlled Upstream packages are provided to users:
spack config --scope site add "upstreams:shared-spack-1:install_tree:${SPACK_ROOT}/opt/spack"
spack config --scope site add "upstreams:shared-spack-1:modules:tcl:${SPACK_ROOT}/share/spack/modules"
spack config --scope site add "upstreams:shared-spack-1:modules:lmod:${SPACK_ROOT}/share/spack/lmod"
