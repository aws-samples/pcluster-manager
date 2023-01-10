from marshmallow import validate

# PC available regions
PC_REGIONS = [
    'us-east-2','us-east-1','us-west-1','us-west-2',
    'af-south-1','ap-east-1','ap-south-1','ap-northeast-2',
    'ap-southeast-1','ap-southeast-2','ap-northeast-1',
    'ca-central-1','cn-north-1','cn-northwest-1',
    'eu-central-1','eu-west-1','eu-west-2',
    'eu-south-1','eu-west-3','eu-north-1','me-south-1',
    'sa-east-1','us-gov-east-1','us-gov-west-1'
]


def comma_splittable(arg: str):
    try:
        arg.split(',')
        return True
    except:
        return False

aws_region_validator = validate.OneOf(choices=PC_REGIONS)
