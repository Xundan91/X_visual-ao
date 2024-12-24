import { CommonTags, GOLD_SKY_GQL } from "./constants";
import { connect, createDataItemSigner } from "@permaweb/aoconnect";
import { createDataItemSigner as nodeCDIS } from "@permaweb/aoconnect/node";
import { Tag } from "./types";

export async function findMyPIDs(owner: any, length?: number, cursor?: string, pName?: string) {
  const processes = await fetch(GOLD_SKY_GQL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query: findMyPIDsQuery(owner, length, cursor, pName)
    })
  });

  const data = await processes.json();
  if (data.errors) {
    throw new Error(data.errors[0].message)
  }

  return data.data?.transactions?.edges?.map((x: any) => {
    // x.node.id
    const processName = x.node.tags.find((tag: any) => tag.name === "Name")?.value;
    return {
      id: x.node.id,
      name: processName,
      cursor: x.cursor
    }
  });
}

function findMyPIDsQuery(owner: string, length?: number, cursor?: string, pName?: string) {
  return `query {
        transactions(owners: ["${owner}"], tags: [
          {name: "Type", values: ["Process"]},
          {name: "Variant", values: ["ao.TN.1"]},
          {name: "Data-Protocol", values: ["ao"]},
          ${pName ? `{name: "Name", values: ["${pName}"], match: FUZZY_OR}` : ""}
         ],
        sort: HEIGHT_DESC,
        first: ${length || 11},
        ${cursor ? `after: "${cursor}"` : ""}
        )
        {
          edges {
            cursor
            node {
              id,
              tags{
                name,
                value
              }
            }
          }
        }
      }`
}


export async function runLua(code: string, process: string, tags?: Tag[]) {
  const ao = connect();

  if (tags) {
    tags = [...CommonTags, ...tags];
  } else {
    tags = CommonTags;
  }

  tags = [...tags, { name: "Action", value: "Eval" }];


  const message = await ao.message({
    process,
    data: code,
    signer: (window.arweaveWallet as any)?.signDataItem ? createDataItemSigner(window.arweaveWallet) : nodeCDIS(window.arweaveWallet),
    tags,
  });

  const result = await ao.result({ process, message });

  (result as any).id = message;
  return result;
}