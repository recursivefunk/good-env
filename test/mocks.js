
class GetSecretValueCommand {
  constructor ({}) {}
}

class SecretsManagerClientHappy {
  constructor ({}) {}
  send () {
    return Promise.resolve({ SecretString: JSON.stringify({ secretVal1: 'val1', secretVal2: 'val2' }) });
  }
}

class SecretsManagerClientNotHappy {
  constructor ({}) {}
  send () {
    return Promise.reject('Something went wrong');
  }
}

module.exports = {
  GetSecretValueCommand,
  SecretsManagerClientHappy,
  SecretsManagerClientNotHappy,
};