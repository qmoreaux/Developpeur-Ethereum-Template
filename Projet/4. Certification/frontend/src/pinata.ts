// require('dotenv').config();
const key = process.env.NEXT_PUBLIC_PINATA_KEY;
const secret = process.env.NEXT_PUBLIC_PINATA_SECRET;

const axios = require('axios');
const FormData = require('form-data');

export const uploadJSONToIPFS = async (JSONBody: any) => {
    const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
    return axios
        .post(url, JSONBody, {
            headers: {
                pinata_api_key: key,
                pinata_secret_api_key: secret
            }
        })
        .then(function (response: any) {
            return {
                success: true,
                pinataURL: 'https://gateway.pinata.cloud/ipfs/' + response.data.IpfsHash
            };
        })
        .catch(function (error: any) {
            console.log(error);
            return {
                success: false,
                message: error.message
            };
        });
};

export const uploadFileToIPFS = async (file: any) => {
    const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
    let data = new FormData();
    data.append('file', file);

    const metadata = JSON.stringify({
        name: 'testname',
        keyvalues: {
            exampleKey: 'exampleValue'
        }
    });
    data.append('pinataMetadata', metadata);

    const pinataOptions = JSON.stringify({
        cidVersion: 0,
        customPinPolicy: {
            regions: [
                {
                    id: 'FRA1',
                    desiredReplicationCount: 1
                },
                {
                    id: 'NYC1',
                    desiredReplicationCount: 2
                }
            ]
        }
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
        .then(function (response: any) {
            return {
                success: true,
                pinataURL: 'https://gateway.pinata.cloud/ipfs/' + response.data.IpfsHash
            };
        })
        .catch(function (error: any) {
            console.log(error);
            return {
                success: false,
                message: error.message
            };
        });
};
