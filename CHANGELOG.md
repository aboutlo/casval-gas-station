# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [1.4.0](https://github.com/aboutlo/casval-gas-station/compare/v1.3.0...v1.4.0) (2021-05-03)


### Features

* create first draft of order ([#1](https://github.com/aboutlo/casval-gas-station/issues/1)) ([40611bc](https://github.com/aboutlo/casval-gas-station/commit/40611bc54304f3cf21d3950583792e5ec29809bd))
* orders by wallet ([f631e01](https://github.com/aboutlo/casval-gas-station/commit/f631e012e97ea7a71d15b17938f952858a943fd1))

## [1.3.0](https://github.com/aboutlo/casval-gas-station/compare/v1.2.0...v1.3.0) (2021-04-25)


### Features

* log order events even if transakService is disabled ([9363afa](https://github.com/aboutlo/casval-gas-station/commit/9363afad8545150368d553637c52c7ac07c4f04d))

## [1.2.0](https://github.com/aboutlo/casval-gas-station/compare/v1.1.7...v1.2.0) (2021-04-24)


### Features

* add gas refill on demand ([a46c363](https://github.com/aboutlo/casval-gas-station/commit/a46c363f76b858239b8cecd3a0a96e86c78f6cb3))
* gas refill rework ([9c786b2](https://github.com/aboutlo/casval-gas-station/commit/9c786b2ca44296f02b0922fe2f1fb9e5bd06b64d))

### [1.1.7](https://github.com/aboutlo/casval-gas-station/compare/v1.1.6...v1.1.7) (2021-04-22)


### Bug Fixes

* drop env var in the start script ([b31e27a](https://github.com/aboutlo/casval-gas-station/commit/b31e27a51a419fdd683a6baaf11ed00dbfe9ba40))

### [1.1.6](https://github.com/aboutlo/casval-gas-station/compare/v1.1.5...v1.1.6) (2021-04-22)


### Bug Fixes

* add log to print transak env var ([98371e0](https://github.com/aboutlo/casval-gas-station/commit/98371e0c5425f13f261e3e04c27bc4d9710ebeff))

### [1.1.5](https://github.com/aboutlo/casval-gas-station/compare/v1.1.4...v1.1.5) (2021-04-22)


### Bug Fixes

* swap polygon rpc urls between mumbay and mainnet ([0df9bb0](https://github.com/aboutlo/casval-gas-station/commit/0df9bb01f19c5edd39efd6e9e0d1760b1a6ac5a3))

### [1.1.4](https://github.com/aboutlo/casval-gas-station/compare/v1.1.3...v1.1.4) (2021-04-22)

### [1.1.3](https://github.com/aboutlo/casval-gas-station/compare/v1.1.2...v1.1.3) (2021-04-22)

### [1.1.2](https://github.com/aboutlo/casval-gas-station/compare/v1.1.1...v1.1.2) (2021-04-22)

### [1.1.1](https://github.com/aboutlo/casval-gas-station/compare/v1.1.0...v1.1.1) (2021-04-22)

## [1.1.0](https://github.com/aboutlo/casval-gas-station/compare/v1.0.1...v1.1.0) (2021-04-22)


### Features

* add multy chain support to handle polygon ([8482dbf](https://github.com/aboutlo/casval-gas-station/commit/8482dbf1cbd539ffb6889a3942bc1cef15d650bb))
* add nonceManager ([26ba268](https://github.com/aboutlo/casval-gas-station/commit/26ba26872a44525e92738303e3d2f9b60a0791e6))
* add ramp network webhook ([3f8e1ad](https://github.com/aboutlo/casval-gas-station/commit/3f8e1ad2c7f1aeca09710701c4933a92fcf5f599))
* add transferToken for kovan ([1713303](https://github.com/aboutlo/casval-gas-station/commit/17133039d848e22d073fe56157b16772c516a68e))
* log level for google cloud ([e43e871](https://github.com/aboutlo/casval-gas-station/commit/e43e871d51a2a0b7ffd943bf492500acb8dbdfc4))
* send required gas for invest and withdraw ([007affb](https://github.com/aboutlo/casval-gas-station/commit/007affb5a65714c46ad48a9d24f5c64a9f421ab3))
* start TransakService based on TRANSAK_SERVICE env variable ([22ed73d](https://github.com/aboutlo/casval-gas-station/commit/22ed73db7e53c3c4c42d497d107e03be13d29102))
* transakService sendGas after funds ([293629e](https://github.com/aboutlo/casval-gas-station/commit/293629ebfee20dcb366327c4105d0fa0fbeff036))


### Bug Fixes

* add allowance gas ([30ef616](https://github.com/aboutlo/casval-gas-station/commit/30ef6169988cc55047f9de9d08b83329c237d4a1))
* add BINDING env var validation ([c221287](https://github.com/aboutlo/casval-gas-station/commit/c221287fdf5f2a2849dc802a64e4fe2158ba4e04))
* add default PORT based on env configs ([91bd1eb](https://github.com/aboutlo/casval-gas-station/commit/91bd1eb711f85e9fd9e9fa80e1a27fc18116e075))
* detect targetnetwork based on NETWORKS and Transak order ([e17e86c](https://github.com/aboutlo/casval-gas-station/commit/e17e86c8e9f551d1b148867e2fb7560997093e6a))
