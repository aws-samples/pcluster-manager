import logging


class DefaultLogger(object):
  def __init__(self, is_running_local):
    self.logger = logging.getLogger("pcluster-manager")
    if is_running_local:
      handler = logging.StreamHandler()
      handler.setFormatter(logging.Formatter("%(asctime)s - %(levelname)s - %(message)s"))
      self.logger.addHandler(handler)
      self.logger.setLevel(logging.DEBUG)
    else:
      self.logger.setLevel(logging.INFO)

  def _log_output(self, msg, extra):
    _extra = {} if extra is None else extra
    _extra["message"] = msg
    return _extra

  def debug(self, msg, extra=None):
    self.logger.debug(self._log_output(msg, extra)) 

  def info(self, msg, extra=None):
    self.logger.info(self._log_output(msg, extra))  

  def warning(self, msg, extra=None):
    self.logger.warning(self._log_output(msg, extra))   
    
  def error(self, msg, extra=None):
    self.logger.error(self._log_output(msg, extra), exc_info=True)

  def critical(self, msg, extra=None):
    self.logger.critical(self._log_output(msg, extra), exc_info=True)
