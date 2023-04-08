// require('dotenv').config();
const key = process.env.NEXT_PUBLIC_PINATA_KEY;
const secret = process.env.NEXT_PUBLIC_PINATA_SECRET;

const axios = require('axios');
const FormData = require('form-data');

export const uploadJSONToIPFS = async (JSONBody: any, pinataName: string) => {
    const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
    return axios
        .post(
            url,
            {
                pinataMetadata: {
                    name: pinataName
                },
                pinataContent: JSONBody
            },
            {
                headers: {
                    pinata_api_key: key,
                    pinata_secret_api_key: secret
                }
            }
        )
        .then((response: any) => {
            return {
                success: true,
                pinataURL: 'https://ipfs.io/ipfs/' + response.data.IpfsHash
            };
        })
        .catch((error: any) => {
            console.error(error);
            return {
                success: false,
                message: error.message
            };
        });
};

export const uploadFileToIPFS = async (file: any, pinataName: string) => {
    const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
    let data = new FormData();
    data.append('file', file);

    const metadata = JSON.stringify({
        name: pinataName
    });
    data.append('pinataMetadata', metadata);

    const pinataOptions = JSON.stringify({
        cidVersion: 0
    });
    data.append('pinataOptions', pinataOptions);

    return axios
        .post(url, data, {
            maxBodyLength: 'Infinity',
            headers: {
                'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
                pinata_api_key: key,
                pinata_secret_api_key: secret
            }
        })
        .then((response: any) => {
            return {
                success: true,
                pinataURL: 'https://ipfs.io/ipfs/' + response.data.IpfsHash
            };
        })
        .catch((error: any) => {
            console.error(error);
            return {
                success: false,
                message: error.message
            };
        });
};

export const updateFileName = async (ipfsHash: any, pinataName: string) => {
    const url = `https://api.pinata.cloud/pinning/hashMetadata`;
    return axios
        .put(
            url,
            {
                ipfsPinHash: ipfsHash,
                name: pinataName
            },
            {
                headers: {
                    pinata_api_key: key,
                    pinata_secret_api_key: secret
                }
            }
        )
        .then((response: any) => {
            return {
                success: true,
                pinataURL: 'https://ipfs.io/ipfs/' + response.data.IpfsHash
            };
        })
        .catch((error: any) => {
            console.error(error);
            return {
                success: false,
                message: error.message
            };
        });
};

export const unpinFileFromIPFS = async (ipfsHash: any) => {
    const url = `https://api.pinata.cloud/pinning/unpin/${ipfsHash}`;
    return axios
        .delete(url, {
            headers: {
                pinata_api_key: key,
                pinata_secret_api_key: secret
            }
        })
        .then(() => {
            return {
                success: true
            };
        })
        .catch((error: any) => {
            console.error(error);
            return {
                success: false,
                message: error.message
            };
        });
};
