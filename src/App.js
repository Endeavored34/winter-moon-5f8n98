import React, { Fragment, useState } from "react";
import { gql } from "apollo-boost";
import { useSubscription } from "@apollo/react-hooks";
import _ from "lodash";
import "./styles.css";

import { Howl } from "howler";

const MESSAGE_SUB = gql`
  subscription messages($id: String!) {
    messages(id: $id) {
      service
      user
      message
      timestamp
      author
      meta {
        __typename
        ... on TwitchMessageMeta {
          channel
          user {
            displayName
            badges {
              url
            }
            color
          }
          emotes {
            id
            text
            url
          }
        }
        ... on DiscordMessageMeta {
          channel
          user {
            id
            nickname
            avatar
            color
          }
        }
      }
    }
  }
`;

const replaceTextForEmotes = (message, emotes) => {
  let tempMessage = message;
  try {
    for (let emote of emotes) {
      let reg = new RegExp(emote.text, "g");
      tempMessage = tempMessage.replace(
        reg,
        `<img src="${emote.url}" alt="${emote.text}" />`
      );
    }
  } catch {
    return message;
  }

  return tempMessage;
};

export const App = () => {
  const [messages, setMessages] = useState([]);

  useSubscription(MESSAGE_SUB, {
    variables: {
      id: "5e813e8e1ef380526668d132"
      //id: "5e714ab494ee1f0011e57d00"
    },
    shouldResubscribe: true,
    onSubscriptionData: ({ subscriptionData: { data } }) => {
      const { messages: msg } = data;

      /*var sound = new Howl({
        src: [
          "https://uploads.codesandbox.io/uploads/user/e20c206c-67ec-46a5-a016-dd3fa92aa113/qWQV-icq-uh-oh[1].mp3"
        ]
      });
      sound.play();*/
      if (!_.isEmpty(msg)) {
        setMessages([...messages, msg]);
      }
    }
  });

  return (
    <div className="App">
      <h1>#ericsource auf Twitch & Discord</h1>
      <div
        style={{
          display: "flex",
          flexDirection: "column-reverse",
          justifyContent: "flex-start"
        }}
      >
        {messages.map((message, i) => {
          if (message.service === "TWITCH") {
            const withEmojis = replaceTextForEmotes(
              message.message,
              message.emotes
            );

            return (
              <div key={`message-${i}`} className="animated bounceInLeft">
                <span style={{ color: message.user.color }}>
                  {message.meta.user.badges.map(({ url }, i) => (
                    <img key={`badge-${i}`} src={url} alt="badge" />
                  ))}
                  [{message.meta.user.displayName}]
                </span>
                :{" "}
                <span
                  dangerouslySetInnerHTML={{
                    __html: withEmojis
                  }}
                />
              </div>
            );
          } else if (message.service === "DISCORD") {
            console.log(message);
            return (
              <div key={`message-${i}`} className="animated bounceInLeft">
                {message.meta.user.avatar && (
                  <img
                    key={`avatar-${i}`}
                    src={`https://cdn.discordapp.com/avatars/${
                      message.meta.user.id
                    }/${message.meta.user.avatar}.jpg?size=16`}
                    alt="avatar"
                  />
                )}
                <span style={{ color: message.meta.user.color }}>
                  [{message.meta.user.nickname}]
                </span>
                : <span>{message.message}</span>
              </div>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
};
