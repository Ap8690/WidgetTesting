import { useState, useEffect } from "react";
import Web3 from "web3";
import React from "react";
import { contractAbi } from "../contractAbi";
import "./modal.css";
import axios from "axios";
import "react-responsive-modal/styles.css";
import { Modal } from "react-responsive-modal";

export default function Widget({ isOpen, setIsOpen , image}) {
    const web3 = new Web3(Web3.givenProvider);
    // let [isOpen, setIsOpen] = useState(false);
    let [isConnect, setIsConnect] = useState(false);
    let [metamaskAddress, setMetamaskAddress] = useState(false);
    let [loading, setLoading] = useState(false);
    // NFT Metadata
    const [nftTitle, setNftTitle] = useState("My NFT");
    const [nftCollection, setNftCollection] = useState("NERDS");
    const [nftRoyalty, setNftRoyalty] = useState("10");
    const [nftDescription, setNftDescription] = useState("");
    const [nftCategory, setNftCategory] = useState("funny");
    const [nftAttributes, setNftAttributes] = useState([]);
    const [nftImage, setNftImage] = useState(null);
    const [copied, setIsCopied] = useState(false);

    function closeModal() {
        if (isConnect) {
            setIsOpen(false);
        }
        setIsConnect(true);
    }

    function openModal() {
        setIsOpen(true);
    }

    // useEffect(()=>{
    //    setNftImage(props.image)
    // },[])
    // create nft formdata
    const createNft = async (nftForm) => {
        // creating metadata
        setLoading(true);
        var formData = new FormData()
        formData.append('name', nftTitle)
        formData.append('royalty', nftRoyalty + '')
        formData.append('image', image[0])
        formData.append('description', nftDescription)
        formData.append('category', nftCategory)
        formData.append('collectionName', nftCollection)
        formData.append('attributes', JSON.stringify(nftAttributes))
        console.log(formData)
        let axiosConfig: any = {
          headers: {
            'Content-Type':
              'multipart/form-data;boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW',
          },
        }

        console.log(formData,"dfjkdshf")

        try {
            var getTokenHash = await axios.post(
                `https://backend.unicus.one/pinata_upload`,
                nftForm,
                axiosConfig
            );
            console.log("NFT-getToken--", getTokenHash);
            var tokenHash = getTokenHash.data;
            console.log("tokenHash--", tokenHash);
            var tokenUri = "https://unicus.mypinata.cloud/ipfs/" + tokenHash;
            console.log("tokenURI--", tokenUri);
        } catch (err) {
            console.log(err);
        }

        // mint nft
        try {
            let contractAddress = "0xDdF22E26BDbdE15e28fd94Aa5580567fE9BfeDb1";
            const mintContract = new web3.eth.Contract(
                contractAbi,
                contractAddress
            );

            let userReject = 0;
            try {
                const res = await mintContract.methods
                    .buyTicket([tokenUri], [10])
                    .send({
                        from: localStorage.getItem("metamask_wallet"),
                        value: 0,
                    });
                console.log(res);

                // upload image to cloudinary
                let cloudinaryFormData = new FormData();
                cloudinaryFormData.append("file", nftImage);
                cloudinaryFormData.append("upload_preset", `Test_Widget`);

                cloudinaryFormData.append(
                    "public_id",
                    res.events.SaleCreated.returnValues._NftId
                );
                console.log(cloudinaryFormData);
                const cloudinaryRes = await fetch(
                    "https://api.cloudinary.com/v1_1/dhmglymaz/image/upload/",
                    {
                        method: "POST",
                        body: cloudinaryFormData,
                    }
                );
                const JSONdata = await cloudinaryRes.json();
                console.log("Cloudinary URL-", JSONdata.url);

                // send to backend

                // var data = JSON.stringify({
                //     name: nftTitle,
                //     jsonHash: tokenUri,
                //     nftType: 'image',
                //     description: nftDescription,
                //     nftClass: nftAttributesClass.name,
                //     gender: nftAttributesGender.name,
                //     accessories: attributesFinalData.data,
                //     colour: nftAttributesColour.name,
                //     others: nftAttributesOthers.name,
                //     breedCount: nftAttributesBreedCount.name,
                //     mintHash: res.transactionHash,
                //     tokenId: res.events.SaleCreated.returnValues._NftId,
                //     mintedBy: metaAddress,
                //     chain: '97',
                //     price: (nftRoyalty * Math.pow(10, 18)).toString(),
                //     category: 'image',
                //     cloudinaryUrl: JSONdata.url,
                //     owner: metaAddress,
                // })

                // var config = {
                //     method: 'post',
                //     url: `${process.env.REACT_APP_BACKEND_URL}/nft`,
                //     headers: {
                //         'Content-Type': 'application/json',
                //     },
                //     data: data,
                // }

                // axios(config)
                //     .then(function (response) {
                //         console.log(JSON.stringify(response.data))
                //     })
                //     .catch(function (error) {
                //         console.log(error)
                //     })
            } catch (err) {
                console.log(err);
                userReject = 1;
                // setTransactionFail(true)
                setLoading(false);
                setIsOpen(false)
            }
            if (!userReject) {
                // setTransactionSuccess(true)
                setLoading(false);
            }
        } catch (error) {
            console.log(error);
            setIsOpen(false)
        }

        setLoading(false);
        setIsOpen(false)
    };

    // Metamask
    let ethereum = 0;
    if (!window.ethereum) {
        console.log("Please install metamask");
    } else {
        ethereum = window.ethereum;
    }
    async function connectToMetamask() {
        try {
            const get = localStorage.getItem("networkID");

            const id = web3.eth.net.getId();
            if (!window.ethereum) {
                return window.alert("Please install Metamask first...");
            }
            // await getAccount();
            const accounts = await ethereum.request({
                method: "eth_requestAccounts",
            });
            console.log("get Account", accounts[0]);
            localStorage.setItem("metamask_wallet", accounts[0]);
            setIsConnect(true);
            setMetamaskAddress(accounts[0]);
            localStorage.setItem("walletType", "Metamask");
        } catch (error) {
            console.error(error?.message);
        }
    }
    if (window.ethereum) {
        window.ethereum.on("accountsChanged", function (accounts) {
            console.log(accounts[0]);
            setMetamaskAddress(accounts[0]);
            localStorage.setItem("metamask_wallet", accounts[0]);
        });
    }

    useEffect(async () => {
        const chainId = await web3.eth.getChainId();
        console.log(chainId, "");
        if (chainId !== 97) {
            try {
                await window.ethereum.request({
                    method: "wallet_switchEthereumChain",
                    params: [{ chainId: "0x61" }], // chainId must be in hexadecimal numbers
                });
            } catch (err) {
                if (err.code === 4902)
                    window.ethereum.request({
                        method: "wallet_addEthereumChain",
                        params: [
                            {
                                chainId: "0x61",
                                chainName: "BSC Test Network",
                                nativeCurrency: {
                                    name: "Binance Coin",
                                    symbol: "BNB",
                                    decimals: 18,
                                },
                                rpcUrls: ["https://data-seed-prebsc-1-s1.binance.org:8545/"],
                                blockExplorerUrls: ["https://bscscan.com"],
                            },
                        ],
                    });
            }
        }
    }, [metamaskAddress]);

    // batch mint
    const batchMint = async () => {
        let contractAddress = "0xDdF22E26BDbdE15e28fd94Aa5580567fE9BfeDb1";

        const mintContract = new web3.eth.Contract(
            contractAbi,
            contractAddress
        );

        try {
            const res = await mintContract.methods
                .buyTicket(["xyxx"], [10])
                .send({
                    from: localStorage.getItem("metamask_wallet"),
                    value: 0,
                })
                .then(() => {
                    setIsOpen(false);
                });
            console.log(res);
        } catch (err) {
            console.log(err);
            setIsOpen(false);
        }
    };
    useEffect(() => {
        if (copied) {
            setTimeout(() => {
                setIsCopied(false);
            }, 2500);
        }
    }, [copied]);
    return (
        <>
            <div className="unicus-widget">
                <button
                    // type="button"
                    onClick={openModal}
                    className="unicus-open-dialog unicus-button"
                >
                    Open dialog
                </button>
            </div>

            <Modal open={isOpen} onClose={closeModal} center>
                <div className="centre-dialog padding-container">
                    {/* <h2 className="text-heading">Unicus.one</h2> */}

                    <div className="metamask-address">
                        {metamaskAddress && (
                            <div className="">
                                {metamaskAddress}
                                {!copied && (
                                    <img
                                        onClick={() => {
                                            navigator.clipboard.writeText(
                                                metamaskAddress
                                            );
                                            setIsCopied(true);
                                        }}
                                        className="copy-icon"
                                        src="https://www.svgrepo.com/show/3110/copy.svg"
                                        alt="wallet"
                                    />
                                )}
                                {copied && (
                                    <img
                                        className="copy-icon"
                                        src="https://cdns.iconmonstr.com/wp-content/assets/preview/2012/240/iconmonstr-check-mark-1.png"
                                        alt=""
                                    />
                                )}
                            </div>
                        )}
                    </div>

                    <div className="wallet-connect-heading">
                        {isConnect
                            ? "Your wallet is successfully connected now!"
                            : "Connect your Metamask Account"}
                    </div>

                    <div>
                        {isConnect ? (
                            <button
                                type="button"
                                className="unicus-button"
                                onClick={createNft}
                            >
                                Mint
                            </button>
                        ) : (
                            <button
                                type="button"
                                className="unicus-button"
                                onClick={connectToMetamask}
                            >
                                Connect Wallet{" "}
                                <img
                                    className="metamask-connect-wallet"
                                    src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg"
                                    alt=""
                                />
                            </button>
                        )}
                    </div>
                    {/* <img className="logo-image-UNICUS" src={logo} alt="unicus.one"/> */}
                    <p className="logo-image-tagline">
                        Web3.0 powered by UnicusOne
                    </p>
                </div>
            </Modal>
        </>
    );
}
