/**
 * Demonstrates how to mint NFTs and store their metadata on chain using the Metaplex MetadataProgram
 */

// import custom helpers for demos
import { payer, connection } from "@/lib/vars";
import {
  explorerURL,
  loadOrGenerateKeypair,
  loadPublicKeysFromFile,
  printConsoleSeparator,
} from "@/lib/helpers";

import { PublicKey } from "@solana/web3.js";
import { Metaplex, bundlrStorage, keypairIdentity } from "@metaplex-foundation/js";
import metadataList from "./metadatas.json";

(async () => {
  //////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  console.log("Payer address:", payer.publicKey.toBase58());

  //////////////////////////////////////////////////////////////////////////////

  // load the stored PublicKeys for ease of use
  let localKeys = loadPublicKeysFromFile();

  // ensure the desired script was already run
  if (!localKeys?.tokenMint)
    return console.warn("No local keys were found. Please run '3.createTokenWithMetadata.ts'");

  const tokenMint: PublicKey = localKeys.tokenMint;
  const publicKeyMinter = new PublicKey("8YAPGJDr5T49sLvPum2kAoLCVXPWxDMEiZ2gcHZtjtXH");
  console.log("==== Local PublicKeys loaded ====");
  console.log("Token's mint address:", tokenMint.toBase58());
  console.log(explorerURL({ address: tokenMint.toBase58() }));

  //////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  // create an instance of Metaplex sdk for use
  const metaplex = Metaplex.make(connection)
    // set our keypair to use, and pay for the transaction
    .use(keypairIdentity(payer))
    // define a storage mechanism to upload with
    .use(
      bundlrStorage({
        address: "https://devnet.bundlr.network",
        providerUrl: "https://api.devnet.solana.com",
        timeout: 60000,
      }),
    );

  /// colection
  //   const { collection, response: collectionResponse } = await metaplex.collections().create({
  //     name: "My Collection",
  //     symbol: "COLL",
  //     uri: "https://example.com/collection",
  //     creators: [{ address: publicKeyMinter, verified: true, share: 100 }],
  //     sellerFeeBasisPoints: 500, // Represents 5.00%.
  //     royaltyPayments: [], // Optional: Define royalties for creators.
  //   });

  console.log("Uploading metadata...");
  for (let i = 0; i < 3; i++) {
    ///metadataList.length; i++) {
    // upload the JSON metadata
    const metadata = metadataList[i];
    const { uri } = await metaplex.nfts().uploadMetadata(metadata);

    console.log("Metadata uploaded:", uri);

    printConsoleSeparator("NFT details");

    console.log("Creating NFT using Metaplex...");

    // create a new nft using the metaplex sdk
    const { nft, response } = await metaplex.nfts().create({
      uri: uri,
      name: metadata.name,
      symbol: metadata.symbol,
      // `sellerFeeBasisPoints` is the royalty that you can define on nft
      sellerFeeBasisPoints: 550, // Represents 5.50%.
      isMutable: true,
      //   isCollection: true,
      //   collection: payer.publicKey,
      //   collectionAuthority: loadOrGenerateKeypair("payer"),
    });

    //console.log(nft);
    console.log("NFT created:", i + 1);
    printConsoleSeparator("NFT created:");
    console.log(explorerURL({ txSignature: response.signature }));
  }
  /**
   *
   */

  //   printConsoleSeparator("Find by mint:");

  //   // you can also use the metaplex sdk to retrieve info about the NFT's mint
  //   const mintInfo = await metaplex.nfts().findByMint({
  //     mintAddress: tokenMint,
  //   });
  //   console.log(mintInfo);
  return;
})();
