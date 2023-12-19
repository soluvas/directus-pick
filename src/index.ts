import { program } from "commander";
import * as fs from "fs";
import YAML from "yaml";

type ISchema = {
  version: number;
  directus: string;
  vendor: string;
  collections: { collection: string }[];
  fields: { collection: string }[];
  relations: { collection: string }[];
};

async function main() {
  program
    .name("directus-pick")
    .argument("<original-schema-file>", "Original Directus schema file")
    .argument("<picked-schema-file>", "Directus schema file to be picked")
    .argument(
      "<collection-name(s)>",
      "Collection name(s) to be picked, separate multiple collections with a comma"
    );
  program.parse();
  // console.log("directus-pick", program.args);
  const pickedCollectionNames = program.args[2].split(",");
  const originalSchema: ISchema = YAML.parse(
    fs.readFileSync(program.args[0], "utf8")
  );
  const pickedSchema: ISchema = YAML.parse(
    fs.readFileSync(program.args[1], "utf8")
  );

  // Remove the collections, fields, and relations from original schema
  const includedCollections = originalSchema.collections.filter(
    (coll) => !pickedCollectionNames.includes(coll.collection)
  );
  const includedFields = originalSchema.fields.filter(
    (field) => !pickedCollectionNames.includes(field.collection)
  );
  const includedRelations = originalSchema.relations.filter(
    (relation) => !pickedCollectionNames.includes(relation.collection)
  );

  // Add the collections, fields, and relations from picked schema
  const pickedCollections = pickedSchema.collections.filter((coll) =>
    pickedCollectionNames.includes(coll.collection)
  );
  // console.debug("Picked collections:");
  // console.debug(YAML.stringify(pickedCollections));
  const pickedFields = pickedSchema.fields.filter((field) =>
    pickedCollectionNames.includes(field.collection)
  );
  const pickedRelations = pickedSchema.relations.filter((relation) =>
    pickedCollectionNames.includes(relation.collection)
  );

  // Result
  const result: ISchema = {
    version: originalSchema.version,
    directus: originalSchema.directus,
    vendor: originalSchema.vendor,
    collections: [...includedCollections, ...pickedCollections],
    fields: [...includedFields, ...pickedFields],
    relations: [...includedRelations, ...pickedRelations],
  };
  console.log(YAML.stringify(result));
}

main();
