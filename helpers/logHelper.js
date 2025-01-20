const commonLogger = (dataObj) => {
  const { level, file, functionName, logObj } = dataObj;

  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    file,
    functionName,
    object: logObj
  }));
};

module.exports = {
  commonLogger
};
