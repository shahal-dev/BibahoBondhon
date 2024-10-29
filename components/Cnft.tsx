// components/Cnft.tsx
import * as React from 'react';
import { toast } from 'react-toastify';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { ExternalLinkIcon } from '@heroicons/react/outline';

// Define the types for the props
interface CnftProps {
    imageURL: string; // This should be the IPFS gateway URL
    metadata: {
        name: string;
        symbol: string;
        description: string;
        attributes: Array<{ trait_type: string; value: string }>;
        externalUrl?: string;
        sellerFeeBasisPoints?: number;
        // Add other metadata fields as needed
    };
}

const Cnft: React.FC<CnftProps> = ({ imageURL, metadata }) => {
    const [apiUrl, setApiUrl] = React.useState<string>("https://devnet.helius-rpc.com/?api-key=593e81f4-0166-4d2f-b9b2-bb891cfbeff0");
    const [nft, setNft] = React.useState<string>("");
    const [nftImage, setNftImage] = React.useState<string>("");

    const { connection } = useConnection();
    const { publicKey } = useWallet();

    const mintCompressedNft = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!publicKey) {
            toast.error("Wallet not connected");
            return;
        }

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: 'bibahonft',
                    method: 'mintCompressedNft',
                    params: {
                        name: metadata.name,
                        symbol: metadata.symbol,
                        owner: publicKey,
                        description: metadata.description,
                        attributes: metadata.attributes,
                        imageUrl: imageURL, // Use the IPFS gateway URL
                        externalUrl: metadata.externalUrl || "",
                        sellerFeeBasisPoints: metadata.sellerFeeBasisPoints || 500, // Default to 5% fee if not provided
                    },
                }),
            });

            const { result } = await response.json();
            console.log("RESULT", result);

            if (!result) {
                toast.error("Request failed");
                throw new Error("Request failed");
            }

            setNft(result.assetId);
            fetchNFT(result.assetId);
        } catch (error) {
            console.error("Minting failed:", error);
            toast.error("Minting failed");
        }
    };

    const fetchNFT = async (assetId: string) => {
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: 'bibahonft',
                    method: 'getAsset',
                    params: {
                        id: assetId,
                    },
                }),
            });

            const { result } = await response.json();

            if (result && result.content && result.content.links && result.content.links.image) {
                const imageHash = result.content.links.image;
                const imageUrl = `https://lime-big-lobster-362.mypinata.cloud/ipfs/${imageHash}`;
                setNftImage(imageUrl);
            } else {
                toast.error("Failed to fetch NFT image");
            }
        } catch (error) {
            console.error("Fetching NFT failed:", error);
            toast.error("Fetching NFT failed");
        }
    };

    const outputs = [
        {
            title: 'Asset ID...',
            dependency: nft,
            href: `https://xray.helius.xyz/token/${nft}?network=devnet`,
        },
    ];
    console.log(outputs)

    React.useEffect(() => {
        setApiUrl("https://devnet.helius-rpc.com/?api-key=593e81f4-0166-4d2f-b9b2-bb891cfbeff0");
    }, [connection]);

    return (
        <main className='max-w-7xl grid grid-cols-1 sm:grid-cols-6 gap-4 p-4 text-white'>
            <form onSubmit={mintCompressedNft} className='rounded-lg min-h-content bg-[#2a302f] p-4 sm:col-span-6 lg:col-start-2 lg:col-end-6'>
                <div className='flex justify-between items-center'>
                    <h2 className='text-lg sm:text-2xl font-semibold'>
                        cNFT Minter 🖼️
                    </h2>
                    <button
                        type='submit'
                        className='bg-helius-orange rounded-lg py-1 sm:py-2 px-4 font-semibold transition-all duration-200 border-2 border-transparent hover:border-helius-orange disabled:opacity-50 disabled:hover:bg-helius-orange hover:border-transparent disabled:cursor-not-allowed'
                        disabled={!publicKey || !connection}
                    >
                        Mint
                    </button>
                </div>

                <div className='text-sm font-semibold mt-8 bg-[#222524] border-2 border-gray-500 rounded-lg p-2'>
                    <ul className='p-2'>
                        {outputs.map(({ title, dependency, href }, index) => (
                            <li key={title} className={`flex justify-between items-center ${index !== 0 && 'mt-4'}`}>
                                <p className='tracking-wider'>{title}</p>
                                {dependency && (
                                    <a
                                        href={href}
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='flex text-[#80ebff] italic hover:text-white transition-all duration-200'
                                    >
                                        {dependency.toString().slice(0, 25)}...
                                        <ExternalLinkIcon className='w-5 ml-1' />
                                    </a>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className='mt-8 bg-[#222524] border-2 border-gray-500 rounded-lg p-4 h-[400px] flex justify-center items-center'>
                    {nftImage ? (
                        <img
                            width={300}
                            height={300}
                            src={nftImage}
                            className='rounded-lg border-2 border-gray-500'
                            alt="Minted NFT"
                        />
                    ) : (
                        <p className='border-2 border-gray-500 text-gray-500 p-2 rounded-lg'>
                            NFT Image Goes Here
                        </p>
                    )}
                </div>
            </form>
        </main>
    );
};

export default Cnft;
