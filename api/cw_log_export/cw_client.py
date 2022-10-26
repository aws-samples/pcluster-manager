import json

import boto3

BUCKET_OBJECT_PREFIX = 'pcm-logs'


class CloudWatchClient:

    def __init__(self, region, cw=None, s3=None, s3_resource=None):
        self.cw = cw if cw else boto3.client('logs')
        self.s3 = s3 if s3 else boto3.client('s3')
        self.s3_resource = s3_resource if s3_resource else boto3.resource('s3')
        self.region = region

    def export_logs_task(self, log_group_name, bucket_name, ts_from, ts_to, log_stream_prefix=None):
        successful = self.__create_log_bucket_if_not_exists(bucket_name)
        if not successful:
            raise Exception(f'Unable to create the bucket \'{bucket_name}\', it probably already exists')

        s3_location = self.__bucket_location(bucket_name)

        export_tasks_params = dict(
            taskName='pcm-export-logs',
            logGroupName=log_group_name,
            fromTime=ts_from, to=ts_to,
            destination=bucket_name,
            destinationPrefix=BUCKET_OBJECT_PREFIX
        )

        if log_stream_prefix:
            export_tasks_params['logStreamNamePrefix'] = log_stream_prefix

        resp = self.cw.create_export_task(**export_tasks_params)

        return dict(task_id=resp['taskId'], URI=s3_location)

    def export_task_status(self, task_id):
        export_tasks = self.cw.describe_export_tasks(taskId=task_id)
        tasks = export_tasks.get('exportTasks', None)
        if not tasks or len(tasks) == 0:
            raise Exception("No export tasks from CloudWatch")

        status = tasks[0]['status']
        dest, dest_prefix = tasks[0]['destination'], tasks[0]['destinationPrefix']
        if 'code' in status and status['code'] == 'COMPLETED':
            return status, self.__bucket_location(dest, dest_prefix)

        return status, None

    def __create_log_bucket_if_not_exists(self, bucket_name):
        try:
            self.s3.create_bucket(Bucket=bucket_name, CreateBucketConfiguration={'LocationConstraint': self.region})
            self.__put_bucket_policy(bucket_name)
            return True
        except:
            return False

    def __bucket_location(self, bucket_name, destination_prefix=None):
        object_part = f'&prefix={destination_prefix}/&showversions=false' if destination_prefix else ''
        return f'https://s3.console.aws.amazon.com/s3/buckets/{bucket_name}?region={self.region}{object_part}'

    def __put_bucket_policy(self, bucket_name):
        return self.s3.put_bucket_policy(
            Bucket=bucket_name,
            Policy=json.dumps({
                "Version": "2012-10-17",
                "Statement": [
                    {
                        "Action": "s3:GetBucketAcl",
                        "Effect": "Allow",
                        "Resource": f'arn:aws:s3:::{bucket_name}',
                        "Principal": {"Service": f'logs.{self.region}.amazonaws.com'}
                    },
                    {
                        "Action": "s3:PutObject",
                        "Effect": "Allow",
                        "Resource": f'arn:aws:s3:::{bucket_name}/{BUCKET_OBJECT_PREFIX}/*',
                        "Condition": {"StringEquals": {"s3:x-amz-acl": "bucket-owner-full-control"}},
                        "Principal": {"Service": f'logs.{self.region}.amazonaws.com'}
                    }
                ]
            })
        )
