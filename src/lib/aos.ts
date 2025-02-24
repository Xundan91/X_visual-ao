import { AOModule, AOScheduler, CommonTags, GOLD_SKY_GQL, APM_ID, APM_INSTALLER } from "./constants";
import { connect, createDataItemSigner, result } from "@permaweb/aoconnect";
import { createDataItemSigner as nodeCDIS } from "@permaweb/aoconnect/node";
import { Tag } from "./types";

export async function findMyPIDs(owner: any, length?: number, cursor?: string, pName = "") {
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

function findMyPIDsQuery(owner: string, length?: number, cursor?: string, pName = "") {
  return `query {
        transactions(owners: ["${owner}"], tags: [
          {name: "Type", values: ["Process"]},
          {name: "Variant", values: ["ao.TN.1"]},
          {name: "Data-Protocol", values: ["ao"]},
          ${pName ? `{name: "Name", values: ["${pName}"], match: FUZZY_OR}` : ""}
        ],
        sort: HEIGHT_DESC,
        first: ${length || 10},
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


export async function runLua(code: string, process: string, tags?: Tag[], dryRun?: boolean) {
  const ao = connect();

  if (tags) {
    tags = [...CommonTags, ...tags];
  } else {
    tags = CommonTags;
  }

  tags = [...tags, { name: "Action", value: "Eval" }];

  if (dryRun) {
    const message = await ao.dryrun({
      process,
      data: code,
      tags,
    });
    return { ...message, id: "dryrun" };
  } else {

    const message = await ao.message({
      process,
      data: code,
      signer: (window.arweaveWallet as any)?.signDataItem ? createDataItemSigner(window.arweaveWallet) : nodeCDIS(window.arweaveWallet),
      tags,
    });

    const result = await ao.result({ process, message });

    return { ...result, id: message };
  }
}

export async function getResults(process: string, cursor = "") {
  const ao = connect();

  const r = await ao.results({
    process,
    from: cursor,
    sort: "ASC",
    limit: 999999,
  });

  if (r.edges.length > 0) {
    const newCursor = r.edges[r.edges.length - 1].cursor;
    const results = r.edges.map((e) => e.node);
    return { cursor: newCursor, results };
  } else {
    return { cursor, results: [] };
  }
}

export function parseOutupt(out: any) {
  console.log(out)
  if (!out.Output) {
    if (out.Error)
      return out.Error;
    return out;
  }
  const data = out.Output.data;
  if (typeof data == "string") return data;
  const { json, output } = data;
  if (json != undefined) {
    return json;
  }
  try {
    return JSON.parse(output);
  } catch (e) {
    return output;
  }
}

export async function spawnProcess(name?: string, tags?: Tag[], newProcessModule?: string) {
  const ao = connect();

  if (tags) {
    tags = [...CommonTags, ...tags];
  } else {
    tags = CommonTags;
  }
  tags = name ? [...tags, { name: "Name", value: name }] : tags;
  tags = [...tags, { name: 'Authority', value: 'fcoN_xJeisVsPXA-trzVAuIiqO3ydLQxM-L4XbrQKzY' }];

  const result = await ao.spawn({
    module: newProcessModule ? newProcessModule : AOModule,
    scheduler: AOScheduler,
    tags,
    signer: (window.arweaveWallet as any)?.signDataItem ? createDataItemSigner(window.arweaveWallet) : nodeCDIS(window.arweaveWallet),
  });

  return result;
}


/// APM

export async function installAPM(process: string) {
  const code = await fetch(APM_INSTALLER).then(res => res.text());
  const result = await runLua(code, process);
  const parsed = parseOutupt(result);
  return parsed;
}


export async function searchPackages(search: string) {
  if (!search) {
    const packages = await runLua(search, APM_ID, [{ name: "Action", value: "APM.Popular" }], true)
    if (packages.Messages.length > 0) {
      return JSON.parse(packages.Messages[0].Data)
    } else {
      return parseOutupt(packages)
    }
  }
  const packages = await runLua(search, APM_ID, [{ name: "Action", value: "APM.Search" }], true)
  if (packages.Messages.length > 0) {
    return JSON.parse(packages.Messages[0].Data)
  } else {
    return parseOutupt(packages)
  }
}

export async function installPackage(name: string, process: string) {
  const code = `apm.install("${name}")`
  console.log(code);
  const result = await runLua(code, process);
  const parsed = parseOutupt(result);
  return parsed;
}