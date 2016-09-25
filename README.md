## Prerequisites

This function is managed and deployed with [Apex](http://apex.run/) ([how to install it](http://apex.run/#installation)).

To manage dependencies you need `npm` installed on your system (and of course Node).

For deployment, you need to setup your AWS secret and key credentials, using [one of available Apex's methods](http://apex.run/#aws-credentials).

## Installation
```
cd <project root>/functions/feed_aggregator

npm install
```

this will install dependencies needed by the function inside `node_modules` subdirectory.

## Deploy
Once setup your AWS credentials, you can launch:

```
cd <project root>

apex deploy
```

## API Gateway setup

To access this function through an http endpoint, you need to setup an AWS API Gateway resource as event source. Follow this [getting starting guide](http://docs.aws.amazon.com/apigateway/latest/developerguide/getting-started.html) to learn how to start, then you need the following adjustement to the API configuration Under APIs > *your api name* > Resources > *your API endpoint* > GET:

* inside *Method Request* add "se_uid" under *URL Query String Parameters*
* inside *Integration Response*, open the default mapping and under *Body Mapping Templates* add a mapping template, specify "application/json" for the Content-Type and put the following code in the template body:
```
#set($inputRoot = $input.path('$'))
$inputRoot.feed
```

When done, you can access your brand new uber-feed for any StackeExchange user through an url like this:

```
https://<your api id>.execute-api.<your region>.amazonaws.com/prod/<your api endpoint name>?se_uid=XXXXXX
```

where `XXXXXX` is the id of the user on [stackexchange.com](https://stackexchange.com), like this:

```
https://stackexchange.com/users/226046/kesonno
```

To see your personal page, login to [stackexchange.com](https://stackexchange.com) and click on your username on the main navigation bar on the top of the page.
