import axios from 'axios';

const PINATA_API_KEY = 'YOUR_PINATA_API_KEY'; // Make sure to replace this
const PINATA_SECRET_API_KEY = 'YOUR_PINATA_SECRET_API_KEY'; // Make sure to replace this

const pinFileToIPFS = async (file) => {
  const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
  const formData = new FormData();
  formData.append('file', file);

  const options = {
    headers: {
      'Content-Type': `multipart/form-data`, // Let Axios handle the boundary
      pinata_api_key: "de1f1de41070064b7b23",
      pinata_secret_api_key: "14c387d211325f2c0a64e16857999dd7abf572fa61bb5ab4428b850eaf761327",
    },
  };

  try {
    const response = await axios.post(url, formData, options);
    console.log("Uploaded successfully:", response.data); // Log the response
    return `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
  } catch (error) {
    console.error("Error uploading file to Pinata", error);
    throw new Error("Failed to upload file");
  }
};

export { pinFileToIPFS };
