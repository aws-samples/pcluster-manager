#!/bin/bash
#Description: Install Spack on ParallelCluster spack.sh [/shared_dir]

export USER=$cfn_cluster_user
export SPACK_ROOT=${1}

mkdir -p $SPACK_ROOT
git clone -c feature.manyFiles=true https://github.com/spack/spack $SPACK_ROOT
cd $SPACK_ROOT

echo "export SPACK_ROOT=$SPACK_ROOT" >> /home/$USER/.bashrc
echo "source \$SPACK_ROOT/share/spack/setup-env.sh" >> /home/$USER/.bashrc

# Activate spack for some quick configuration
source $SPACK_ROOT/share/spack/setup-env.sh

# Find gcc and other compilers on PATH
spack compiler find --scope site 
spack external find --scope site

# Root retains control of upstream packages
cat ${SPACK_INSTALL_PREFIX}/spack/etc/spack/defaults/config.yaml > ~/.spack/config.yaml
spack config --scope user add "config:module_roots:tcl:${SPACK_INSTALL_PREFIX}/spack/share/spack/modules"
spack config --scope user add "config:module_roots:lmod:${SPACK_INSTALL_PREFIX}/spack/share/spack/lmod"

# Users control packages local to their account
spack config --scope site add "config:install_tree:root:~/.spack/install"
spack config --scope site add "config:module_roots:tcl:~/.spack/modules"
spack config --scope site add "config:module_roots:lmod:~/.spack/lmod"
spack config --scope site add "config:source_cache:~/.spack/cache"
#spack config --scope site add "config:build_stage:~/.spack/stage"
spack config --scope site add "config:template_dirs:~/.spack/templates"
              
# Root-controlled Upstream packages are provided to users: 
spack config --scope site add "upstreams:site:install_tree:${SPACK_INSTALL_PREFIX}/spack/opt/spack"
spack config --scope site add "upstreams:site:modules:tcl:${SPACK_INSTALL_PREFIX}/spack/share/spack/modules"
spack config --scope site add "upstreams:site:modules:lmod:${SPACK_INSTALL_PREFIX}/spack/share/spack/lmod"

# Improve usability of spack for Tcl Modules
spack config --scope site add "modules:tcl:all:autoload: direct"
spack config --scope site add "modules:tcl:verbose: True"
spack config --scope site add "modules:tcl:hash_length: 6"
spack config --scope site add "modules:tcl:projections:all: '{name}/{version}-{compiler.name}-{compiler.version}'"
spack config --scope site add "modules:tcl:all:conflict: ['{name}']"
spack config --scope site add "modules:tcl:all:suffixes:^cuda: cuda"
spack config --scope site add "modules:tcl:all:environment:set:{name}_ROOT: '{prefix}'"
