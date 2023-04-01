// File is needed to get some introspection data to make fragments work properly

export const getFragmentTypes = async () => {
  const result = await fetch(`https://flauschig.io/graphql`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      variables: {},
      query: `
        {
          __schema {
            types {
              kind
              name
              possibleTypes {
                name
              }
            }
          }
        }
      `
    })
  });
  let data = await result.json();

  const filteredData = data.data.__schema.types.filter(
    type => type.possibleTypes !== null
  );
  data.data.__schema.types = filteredData;
  return data.data;
};
