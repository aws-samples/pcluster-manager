from marshmallow import Schema, fields, validate, INCLUDE

from api.validation.validators import comma_splittable, aws_region_validator, is_alphanumeric_with_hyphen, valid_api_log_levels_predicate
from api.logging import VALID_LOG_LEVELS


class EC2ActionSchema(Schema):
    action = fields.String(required=True, validate=validate.OneOf(['stop_instances', 'start_instances']))
    instance_ids = fields.String(required=True, validate=comma_splittable)
    region = fields.String(validate=aws_region_validator)


EC2Action = EC2ActionSchema(unknown=INCLUDE)


class CreateUserSchema(Schema):
    Username = fields.Email(required=True)
    Phonenumber = fields.String()


CreateUser = CreateUserSchema(unknown=INCLUDE)


class DeleteUserSchema(Schema):
    username = fields.UUID(required=True)

DeleteUser = DeleteUserSchema(unknown=INCLUDE)


class GetClusterConfigSchema(Schema):
    region = fields.String(validate=aws_region_validator)
    cluster_name = fields.String(required=True, validate=is_alphanumeric_with_hyphen)

GetClusterConfig = GetClusterConfigSchema(unknown=INCLUDE)


class GetCustomImageConfigSchema(Schema):
    image_id = fields.String(required=True, validate=is_alphanumeric_with_hyphen)

GetCustomImageConfig = GetCustomImageConfigSchema(unknown=INCLUDE)


class GetAwsConfigSchema(Schema):
    region = fields.String(validate=aws_region_validator)

GetAwsConfig = GetAwsConfigSchema(unknown=INCLUDE)


class GetInstanceTypesSchema(Schema):
    region = fields.String(validate=aws_region_validator)

GetInstanceTypes = GetInstanceTypesSchema(unknown=INCLUDE)


class LoginSchema(Schema):
    code = fields.String(required=True)

Login = LoginSchema(unknown=INCLUDE)


class PushLogSchema(Schema):
    class PushLogEntrySchema(Schema):
        level = fields.String(required=True, validate=valid_api_log_levels_predicate)
        message = fields.String(required=True)
        extra = fields.Dict()

    logs = fields.List(fields.Nested(PushLogEntrySchema), required=True)

PushLog = PushLogSchema(unknown=INCLUDE)

class PriceEstimateSchema(Schema):
    cluster_name = fields.String(required=True)
    queue_name = fields.String(required=True)
    region = fields.String(validate=aws_region_validator, required=True)

PriceEstimate = PriceEstimateSchema(unknown=INCLUDE)