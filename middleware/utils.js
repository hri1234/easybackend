exports.generateClientId = () => {
    return 'client_' + Math.random().toString(36).substr(2, 18);
  };
  
  exports.generateSecretKey = () => {
    return 'secret_' + Math.random().toString(36).substr(2, 18);
  };
  
  exports.generateCode = () => {
    return Math.random().toString(36).substr(2, 18);
  };