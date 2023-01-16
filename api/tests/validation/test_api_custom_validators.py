import pytest
from marshmallow import ValidationError

from api.validation.validators import size_not_exceeding


def test_size_not_exceeding():
    max_size = 300
    test_str_not_exceeding = 'a' * (max_size - 2) # save 2 chars for double quotes

    size_not_exceeding(test_str_not_exceeding, max_size)

def test_size_not_exceeding_failing():
    max_size = 300
    test_str_not_exceeding = 'a' * max_size # will produce "aaa...", max_size + 2

    with pytest.raises(ValidationError):
        size_not_exceeding(test_str_not_exceeding, max_size)