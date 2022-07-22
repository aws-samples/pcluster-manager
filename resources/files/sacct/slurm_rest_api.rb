require 'json'
return if node['cluster']['node_type'] != 'HeadNode'

slurm_etc = '/opt/slurm/etc'
state_save_location = '/var/spool/slurm.state'
key_location = state_save_location + '/jwt_hs256.key'
certs_location = '/etc/ssl/certs'
key_and_crt_name = 'nginx-selfsigned'
id = 2005

platform = node['platform']
if platform == 'amazon'
  platform = 'amzn2'
end

# Configure Slurm for JWT authentication
ruby_block 'Create JWT key file' do
  block do
    shell_out!("dd if=/dev/random of=#{key_location} bs=32 count=1")
  end
end

# TODO: Not idempotent if user is in process
group 'slurmrestd' do
    comment 'slurmrestd group'
    gid id
    system true
end

user 'slurmrestd' do
  comment 'slurmrestd user'
  uid id
  gid id
  system true
end

file key_location do
  owner 'slurm'
  group 'slurm'
  mode '0600'
end

directory state_save_location do
  owner 'slurm'
  group 'slurm'
  mode '0755'
end

ruby_block 'Add JWT configuration to slurm.conf' do
  block do
    file = Chef::Util::FileEdit.new("#{slurm_etc}/slurm.conf")
    file.insert_line_after_match(/AuthType=*/, "AuthAltParameters=jwt_key=#{key_location}")
    file.insert_line_after_match(/AuthType=*/, "AuthAltTypes=auth/jwt")
    file.write_file
  end
  not_if "grep -q auth/jwt #{slurm_etc}/slurm.conf"
end

ruby_block 'Add JWT configuration to slurmdbd.conf' do
  block do
    file = Chef::Util::FileEdit.new("#{slurm_etc}/slurmdbd.conf")
    file.insert_line_after_match(/AuthType=*/, "AuthAltParameters=jwt_key=#{key_location}")
    file.insert_line_after_match(/AuthType=*/, "AuthAltTypes=auth/jwt")
    file.write_file
  end
  not_if "grep -q auth/jwt #{slurm_etc}/slurmdbd.conf"
end

service 'slurmctld' do
  action :restart
end

ruby_block 'Generate JWT token and create/update AWS secret' do
  block do
    token_name = "slurm_token_" + node['cluster']['stack_name']
    region = node['cluster']['region']

    jwt_token = shell_out!("/opt/slurm/bin/scontrol token lifespan=9999999999 \
      | grep -oP '^SLURM_JWT\\s*\\=\\s*\\K(.+)'").run_command.stdout
    
    begin
      shell_out!("aws secretsmanager create-secret \
        --name #{token_name} \
        --region #{region} \
        --secret-string #{jwt_token}"
      ).run_command
    rescue
      shell_out!("aws secretsmanager update-secret \
        --secret-id #{token_name} \
        --region #{region} \
        --secret-string #{jwt_token}"
      ).run_command
    end
  end
end

# Enable slurmrestd
file '/etc/systemd/system/slurmrestd.service' do
  owner 'slurmrestd'
  group 'slurmrestd'
  mode '0644'
  content ::File.open('/tmp/slurm_rest_api/slurmrestd.service').read
end

service 'slurmrestd' do
  action :start
end

# NGINX installation
package 'nginx' do
  action :install
end

ruby_block 'Generate self-signed key' do
  block do
    shell_out!("sudo openssl req -x509 -nodes -days 36500 -newkey rsa:2048 \
      -keyout /etc/ssl/certs/nginx-selfsigned.key \
      -out /etc/ssl/certs/nginx-selfsigned.crt \
      -subj ""/CN=#{node['cluster']['stack_name']}"""
    ).run_command
  end
end

group 'nginx' do
  comment 'nginx group'
  gid id + 1
  system true
end

user 'nginx' do
  comment 'nginx user'
  uid id + 1
  gid id + 1
  system true
end

file 'etc/nginx/nginx.conf' do
  owner 'nginx'
  group 'nginx'
  mode '0644'
  content ::File.open('/tmp/slurm_rest_api/nginx.conf').read
end

service 'nginx' do
  action :start
end
