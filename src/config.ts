export type Network = 'kovan' | 'mainnet'
interface ConfigProp {
  environment: 'development' | 'staging' | 'production'
  network: Network
  // https://swr.vercel.app/docs/options

  transak: {
    [key: string]: {
      baseURL: string
      apiKey: string
      apiBaseURL: string
      secret: string
      pusherApiKey: string
    }
  }
  alchemy: {
    [key: string]: any
  }
  infura: {
    [key: string]: any
  }
  etherscan: {
    [key: string]: {
      explorerURL: string
      apiBaseURL: string
      apiKey: string
    }
  }
}

export const CONFIG: ConfigProp = {
  environment: 'development',
  network: 'kovan', //Default network
  // refreshInterval: 1000 * 30, //  every 30'' (only if the screen is shown?)
  transak: {
    kovan: {
      apiKey: '0b1a0c3b-6684-4c38-8349-715567beba6c',
      baseURL: 'https://staging-global.transak.com',
      apiBaseURL: 'https://staging-api.transak.com/api/v2',
      secret:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJBUElfS0VZIjoiMGIxYTBjM2ItNjY4NC00YzM4LTgzNDktNzE1NTY3YmViYTZjIiwiaWF0IjoxNjE1OTc4MzMyfQ.PrRwViAsLIJBewq28Mio822a81-vyzzCMr4UdmeAhE4',
      pusherApiKey: '1d9ffac87de599c61283',
    },
    mainnet: {
      apiKey: 'fb0520e2-8eaf-49b5-8f5e-9a92b4362580',
      baseURL: 'https://global.transak.com',
      apiBaseURL: 'https://api.transak.com/api/v2',
      secret:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJBUElfS0VZIjoiZmIwNTIwZTItOGVhZi00OWI1LThmNWUtOWE5MmI0MzYyNTgwIiwiaWF0IjoxNjE1OTc4MzMyfQ.FlHk-kaUl6aCv6_jyhhfHfrnLIH7oLAUBr-MZcsnmDo',
      pusherApiKey: '1d9ffac87de599c61283', // TODO LS do they have a different apiKey for prod?
    },
  },
  alchemy: {
    apiKey: 'lbJ3HMDaSHXyDaZ6r_1h1HUQpA84OQVp',
  },
  infura: {
    apiKey: '2f088a4741984ed085f544d133d88853',
  },
  etherscan: {
    kovan: {
      explorerURL: 'https://kovan.etherscan.io',
      apiBaseURL: 'https://api-kovan.etherscan.io',
      apiKey: '82QKD4WKI5R4D6JZJWKN3GIITS6EHRNEQM',
    },
    mainnet: {
      explorerURL: 'https://etherscan.io',
      apiBaseURL: 'https://api.etherscan.io',
      apiKey: '82QKD4WKI5R4D6JZJWKN3GIITS6EHRNEQM',
    },
  },
}
