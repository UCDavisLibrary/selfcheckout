# Self Checkout
Polymer 3 application for self checkout using Alma served with the [lib-server Node project](https://github.com/UCDavisLibrary/lib-server).

![First page](src/elements/library-self-checkout/img/sh1.png "front page screenshot")
![Modal](src/elements/library-self-checkout/img/sh2.png "modal screenshot")

## Installation

1. Clone this project
2. Run `npm install`
3. Create and fill out your `.env` file using `.env.example` as a template. This is where your Alma API key goes.
4. cd to the `library-self-checkout` element and install its dependencies with `yarn install --flat`
5. Bundle the element by running `npm run watch` (for development) or `npm run dist` (for build)
6. Start the server with `npm start`

## Element Setup

Under `html/index.html`, set the library and circDesk properties to the appropriate values from Alma code table.
```html
    <library-self-checkout library="AlmaLibrary"
                           circdesk="AlmaCircdesk"
                           use_proxy>
    </library-self-checkout>
```

You can use the `logout_time` property to set the duration (ms) of inactivity at which point a user will be logged out.

Additionally, if you want to bypass the proxy server and make calls directly from the browser, remove `use_proxy` and add `alma_key = 'AlmaUserapikey'`. This will obviously expose your api key to all.
