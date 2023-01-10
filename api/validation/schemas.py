from marshmallow import Schema, fields, validate, INCLUDE

from api.validation.validators import comma_splittable, aws_region_validator


class EC2ActionSchema(Schema):
    action = fields.String(required=True, validate=validate.OneOf(['stop_instances', 'start_instances']))
    instance_ids = fields.String(required=True, validate=comma_splittable)
    region = fields.String(validate=aws_region_validator)


EC2Action = EC2ActionSchema(unknown=INCLUDE)
