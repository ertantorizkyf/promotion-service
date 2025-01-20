const sendResponse = (dataObj) => {
  const { res, code, success, message, respData } = dataObj;

  return res.status(code || 500).send({
    success,
    message,
    data: respData
  });
};

module.exports = {
  sendResponse
};
