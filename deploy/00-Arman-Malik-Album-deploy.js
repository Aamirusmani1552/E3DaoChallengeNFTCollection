const { network } = require("hardhat");
const { verify } = require("../utils/verify.js");
const { developementChains } = require("../helper-hardhat-config");
const fs = require("fs");
const path = require("path");
const {pinata} = require("../utils/pinataClient")

const songNames = ["Bol-Do-Na-Zara", "Dil-Mein-Chhupa-Loonga"];
const songs = ["Bol-Do-Na-Zara.mp3", "Dil-Mein-Chhupa-Loonga.mp3"];
const images = ["Bol-Do-Na-Zara-Cover.jpg", "Dil-Mein-Chhupa-Loonga-Cover.jpg"];
const ArtistImage = "Arman-malik-image.PNG";
const durations = ["04:53", "05:31"];

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  let artistImage;
  let tokenURIs;

  if (process.env.UPLOAD_TO_PINATA) {
    console.log("Uploading music files to pinata...");
    const songsHashes = await uploadMusic("../songs", songs);
    console.log("Uploaded Successfully");

    // names in array should be in same order as provided to uploadMusic function
    console.log("Uploading cover files to pinata...");
    const coverPagesHashes = await uploadCoverImages(
      "../songs",
      images
    );
    console.log("Uploaded Successfully");

    console.log("Uploading artist image to ipfs...");
    artistImage = await uploadArtishImage("../songs", ArtistImage);
    console.log("Image Uploaded successfully");

    console.log("uploading Metadata to ipfs...");
    tokenURIs = await uploadMetaData(songsHashes, coverPagesHashes, durations);
    console.log("MetaData Uploaded Successfully");
  }

  log("_________________________________________");
  const args = [tokenURIs, `ipfs://` + artistImage];

  const armanAlbum = await deploy("ArmanMalikMusicAlbum", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: developementChains.includes(network.name) ? 1 : 6,
  });

  if (
    !developementChains.includes(network.name) &&
    (process.env.ETHERSCAN_API_KEY || process.env.MUMBAI_POLYGON_API_KEY)
  ) {
    await verify(armanAlbum.address, args);
  }

  log("___________________________________________");
};

async function uploadMusic(directory, songs) {
  const absolutePath = path.resolve(__dirname, directory);
  const songHashes = [];
  for (let i = 0; i < songs.length; i++) {
    const fileStream = fs.createReadStream(absolutePath + "\\" + songs[i]);
    const options = {
      pinataMetadata:{
        name: songs[i]
      }
    }

    await pinata
      .pinFileToIPFS(fileStream,options)
      .then((data) => {
        songHashes.push(data.IpfsHash);
      })
      .catch((err) => console.log(err));
  }

  console.log(songHashes);
  return songHashes;
}

async function uploadCoverImages(directory, images) {
  const absolutePath = path.resolve(__dirname, directory);
  const imageHashes = [];
  for (let i = 0; i < images.length; i++) {
    const fileStream = fs.createReadStream(absolutePath + "\\" + images[i]);

    const options = {
      pinataMetadata:{
        name: images[i]
      }
    }
    await pinata
      .pinFileToIPFS(fileStream,options)
      .then((data) => {
        imageHashes.push(data.IpfsHash);
      })
      .catch((err) => console.log(err));
  }

  console.log(imageHashes);
  return imageHashes;
}

async function uploadArtishImage(directory, image) {
  const absolutePath = path.resolve(__dirname, directory);
  let imageHash = "";
  console.log(absolutePath);
  const fileStream = fs.createReadStream(absolutePath + "\\" + image);

  const options = {
    pinataMetadata:{
      name: "Arman Malik Cover image"
    }
  }
  await pinata
    .pinFileToIPFS(fileStream,options)
    .then((data) => {
      imageHash = data.IpfsHash;
    })
    .catch((err) => console.log(err));

  console.log(imageHash);
  return imageHash;
}

async function uploadMetaData(songHashes, imageHashes, durations) {
  const tokenURIs = [];

  if (songHashes.length == imageHashes.length) {

    for (let i = 0; i < songHashes.length; i++) {
      await pinata
        .pinJSONToIPFS(
          {
            image: `ipfs://${imageHashes[i]}`,
            name: songs[i],
            animation_url: `ipfs://${songHashes[i]}`,
            duration: durations[i],
            artist: "Arman Malik",
            artistImage: "",
            year: "2022",
          },
          {
            pinataMetadata: {
              name: songNames[i] + " MetaData",
            },
          }
        )
        .then((data) => {
          tokenURIs.push(data.IpfsHash);
        })
        .catch((err) => console.log(err));
    }
  } else {
    new Error("Lengths of Hash files are not Same");
  }
  console.log(tokenURIs, " are token uris");
  return tokenURIs;
}
module.exports.tags = ["all", "armanMalikAlbum"];
