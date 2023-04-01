import React from "react";
import ReactDOM from "react-dom";

import { WebSocketLink } from "apollo-link-ws";
import { ApolloClient } from "apollo-client";
import { ApolloLink } from "apollo-link";
import { createHttpLink } from "apollo-link-http";

import {
  InMemoryCache,
  IntrospectionFragmentMatcher
} from "apollo-cache-inmemory";
import { ApolloProvider } from "@apollo/react-hooks";

import { App } from "./App";
import { getOperationAST } from "graphql";
import { getFragmentTypes } from "./introspection";

(async () => {
  const fragmentTypes = await getFragmentTypes();
  const fragmentMatcher = new IntrospectionFragmentMatcher({
    introspectionQueryResultData: fragmentTypes
  });

  const link = ApolloLink.split(
    operation => {
      const operationAST = getOperationAST(
        operation.query,
        operation.operationName
      );
      return !!operationAST && operationAST.operation === "subscription";
    },

    //@ts-ignore
    new WebSocketLink({
      uri: "wss://flauschig.io/graphql",
      options: {
        reconnect: true,
        connectionParams: () => ({
          authorization: "test"
        })
      },
      onError: error => {
        console.log(error);
      }
    }),
    new createHttpLink({
      uri: "https://flauschig.io/graphql",
      //@ts-ignore
      onError: error => {
        console.log(error);
      }
    })
  );

  const client = new ApolloClient({
    link: ApolloLink.from([link]),
    cache: new InMemoryCache({ fragmentMatcher }),
    connectToDevTools: true
  });

  const ApolloApp = () => (
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  );

  const rootElement = document.getElementById("root");
  ReactDOM.render(
    <React.StrictMode>
      <ApolloApp />
    </React.StrictMode>,
    rootElement
  );
})();
