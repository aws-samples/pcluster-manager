from marshmallow import Schema, fields, validate, INCLUDE

from api.validation.validators import comma_splittable, aws_region_validator, is_alphanumeric_with_hyphen, valid_api_log_levels_predicate

class EC2ActionSchema(Schema):
    action = fields.String(required=True, validate=validate.OneOf(['stop_instances', 'start_instances']))
    instance_ids = fields.String(required=True, validate=validate.And(comma_splittable, validate.Length(max=2048)))
    region = fields.String(validate=aws_region_validator)


EC2Action = EC2ActionSchema(unknown=INCLUDE)


class CreateUserSchema(Schema):
    Username = fields.Email(required=True, validate=validate.Length(max=320)) # Email RFC allows max 320 chars
    Phonenumber = fields.String(validate=validate.Length(max=15)) # ITU-T E.164 allows phone numbers no more than 15 digits


CreateUser = CreateUserSchema(unknown=INCLUDE)


class DeleteUserSchema(Schema):
    username = fields.UUID(required=True)

DeleteUser = DeleteUserSchema(unknown=INCLUDE)


class GetClusterConfigSchema(Schema):
    region = fields.String(validate=aws_region_validator)
    cluster_name = fields.String(required=True, validate=validate.And(is_alphanumeric_with_hyphen, validate.Length(max=60))) # PC allow cluster name of max 60 chars

GetClusterConfig = GetClusterConfigSchema(unknown=INCLUDE)


class GetCustomImageConfigSchema(Schema):
    image_id = fields.String(required=True, validate=validate.And(is_alphanumeric_with_hyphen, validate.Length(min=1, max=1024))) # AMI id min 1, max 1024 chars

GetCustomImageConfig = GetCustomImageConfigSchema(unknown=INCLUDE)


class GetAwsConfigSchema(Schema):
    region = fields.String(validate=aws_region_validator)

GetAwsConfig = GetAwsConfigSchema(unknown=INCLUDE)


class GetInstanceTypesSchema(Schema):
    region = fields.String(validate=aws_region_validator)

GetInstanceTypes = GetInstanceTypesSchema(unknown=INCLUDE)


class GetDcvSessionSchema(Schema):
    user = fields.String(validate=validate.Length(max=64))
    instance_id = fields.String(required=True, validate=validate.Length(max=60))
    region = fields.String(validate=aws_region_validator)

GetDcvSession = GetDcvSessionSchema(unknown=INCLUDE)


class QueueStatusSchema(Schema):
    user = fields.String(validate=validate.Length(max=64))
    instance_id = fields.String(required=True, validate=validate.Length(max=60))
    region = fields.String(required=True, validate=aws_region_validator)

QueueStatus = QueueStatusSchema(unknown=INCLUDE)


class ScontrolJobSchema(Schema):
    user = fields.String(validate=validate.Length(max=64))
    instance_id = fields.String(required=True, validate=validate.Length(max=60))
    job_id = fields.String(required=True, validate=validate.Length(max=256))
    region = fields.String(required=True, validate=aws_region_validator)

ScontrolJob = ScontrolJobSchema(unknown=INCLUDE)


class CancelJobSchema(Schema):
    user = fields.String(validate=validate.Length(max=64))
    instance_id = fields.String(required=True, validate=validate.Length(max=60))
    job_id = fields.String(required=True, validate=validate.Length(max=256))
    region = fields.String(required=True, validate=aws_region_validator)

CancelJob = CancelJobSchema(unknown=INCLUDE)


class SacctSchema(Schema):
    user = fields.String(validate=validate.Length(max=64))
    instance_id = fields.String(required=True, validate=validate.Length(max=32))
    cluster_name = fields.String(required=True, validate=validate.And(is_alphanumeric_with_hyphen, validate.Length(max=60)))
    region = fields.String(required=True, validate=aws_region_validator)

Sacct = SacctSchema(unknown=INCLUDE)


class LoginSchema(Schema):
    code = fields.String(required=True, validate=validate.Length(max=128))

Login = LoginSchema(unknown=INCLUDE)


class PushLogSchema(Schema):
    class PushLogEntrySchema(Schema):
        level = fields.String(required=True, validate=valid_api_log_levels_predicate)
        message = fields.String(required=True, validate=validate.Length(max=246000)) # CW limit is 256k, leaving 1k to extra and level
        extra = fields.Dict()

    logs = fields.List(fields.Nested(PushLogEntrySchema), required=True)

PushLog = PushLogSchema(unknown=INCLUDE)

class PriceEstimateSchema(Schema):
    cluster_name = fields.String(required=True, validate=validate.Length(max=60))
    queue_name = fields.String(required=True, validate=validate.Length(max=60))
    region = fields.String(validate=aws_region_validator, required=True)

PriceEstimate = PriceEstimateSchema(unknown=INCLUDE)

class PCProxySchema(Schema):
    path = fields.String(required=True, validate=validate.Length(max=512))

PCProxy = PCProxySchema(unknown=INCLUDE)