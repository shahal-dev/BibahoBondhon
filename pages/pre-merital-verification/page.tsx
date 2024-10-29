import * as React from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { ExternalLinkIcon } from '@heroicons/react/outline';

interface Attribute {
  trait_type: string;
  value: string;
}

interface NftMetadata {
  symbol?: string;
  name?: string;
  description?: string;
  attributes?: Attribute[];
}

interface Nft {
  id: string;
  content: {
    metadata?: NftMetadata;
  };
  ownership?: {
    owner?: string;
  };
  supply?: any;
}

const Finished = () => {
  const [apiUrl, setApiUrl] = React.useState<string>("");
  const [nfts, setNfts] = React.useState<Nft[]>([]);
  const [filteredNfts, setFilteredNfts] = React.useState<Nft[]>([]);
  const [nid, setNid] = React.useState<string>('');
  const { connection } = useConnection();
  const { publicKey } = useWallet();

  const fetchAndFilterNfts = async () => {
    if (!publicKey) return;

    try {
      // Fetch NFTs
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 'bibahonft',
          method: 'getAssetsByOwner',
          params: {
            ownerAddress: publicKey.toBase58(),
          },
        }),
      });

      const { result } = await response.json();
      console.log("NFTs fetched:", result);

      if (result && result.items) {
        const fetchedNfts: Nft[] = result.items;
        setNfts(fetchedNfts);

        // Filter NFTs based on input NID
        const filtered = fetchedNfts.filter((nft: Nft) => {
          const attributes = nft.content.metadata?.attributes || [];
          const nftBrideNID = attributes.find((attr: Attribute) => attr.trait_type === "Bride's NID")?.value;
          const nftGroomNID = attributes.find((attr: Attribute) => attr.trait_type === "Groom's NID")?.value;

          return (!nid || nid === nftBrideNID || nid === nftGroomNID);
        });

        setFilteredNfts(filtered);
      } else {
        console.error('No NFTs found for this wallet');
        setFilteredNfts([]);
      }
    } catch (error) {
      console.error("Error fetching NFTs:", error);
      setFilteredNfts([]);
    }
  };

  React.useEffect(() => {
    setApiUrl(
      connection.rpcEndpoint.includes("devnet")
        ? "https://devnet.helius-rpc.com/?api-key=593e81f4-0166-4d2f-b9b2-bb891cfbeff0"
        : "https://mainnet.helius-rpc.com/?api-key=593e81f4-0166-4d2f-b9b2-bb891cfbeff0"
    );
  }, [connection]);

  return (
    <main className='max-w-7xl grid grid-cols-1 sm:grid-cols-6 gap-4 p-4 text-white'>
      <div className='rounded-lg min-h-content bg-[#2a302f] p-4 sm:col-span-6 lg:col-start-2 lg:col-end-6'>
        <div className='flex justify-between items-center'>
          <h2 className='text-lg sm:text-2xl font-semibold'>
            Blockchain Certificate Verification
          </h2>
          <button
            onClick={fetchAndFilterNfts}
            className='bg-helius-orange rounded-lg py-1 sm:py-2 px-4 font-semibold transition-all duration-200 border-2 border-transparent hover:border-helius-orange disabled:opacity-50 disabled:hover:bg-helius-orange hover:border-transparent disabled:cursor-not-allowed'
            disabled={!publicKey || !connection}
          >
            Fetch & Filter NFTs
          </button>
        </div>

        <div className='mt-8'>
          <input
            type='text'
            placeholder="Enter NID (Bride's or Groom's)"
            value={nid}
            onChange={(e) => setNid(e.target.value)}
            className='w-full p-4 rounded-lg border border-neutral-800 bg-neutral-950 placeholder:text-neutral-700 text-white'
          />
        </div>

        {/* Display the NFTs */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8'>
          {filteredNfts.length > 0 ? (
            filteredNfts.map((nft: Nft, index: number) => {
              console.log("Filtered NFT Item:", nft);

              const attributes = nft.content.metadata?.attributes || [];
              const brideNID = attributes.find((attr: Attribute) => attr.trait_type === "Bride's NID")?.value || 'N/A';
              const groomNID = attributes.find((attr: Attribute) => attr.trait_type === "Groom's NID")?.value || 'N/A';
              const mintDate = attributes.find((attr: Attribute) => attr.trait_type === 'Date')?.value || 'N/A';

              return (
                <div key={index} className='bg-[#222524] border-2 border-gray-500 rounded-lg p-4'>
                  <a
                    href={`https://xray.helius.xyz/token/${nft.id}?network=devnet`}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='flex text-[#80ebff] italic hover:text-white transition-all duration-200'
                  >
                    {nft.id.slice(0, 25)}...
                    <ExternalLinkIcon className='w-5 ml-1' />
                  </a>

                  <div className="mt-4">
                    <p><strong>Symbol:</strong> {nft.content.metadata?.symbol || 'N/A'}</p>
                    <p><strong>Name:</strong> {nft.content.metadata?.name || 'N/A'}</p>
                    <p><strong>Description:</strong> {nft.content.metadata?.description || 'N/A'}</p>
                    <p><strong>Creator:</strong> {nft.ownership?.owner || 'N/A'}</p>
                    <p><strong>Mint Date:</strong> {mintDate}</p>
                    <p><strong>Bride's NID:</strong> {brideNID}</p>
                    <p><strong>Groom's NID:</strong> {groomNID}</p>
                  </div>
                </div>
              );
            })
          ) : (
            <p className='col-span-3 text-gray-500'>No NFTs found matching the criteria.</p>
          )}
        </div>
      </div>
    </main>
  );
};

export default Finished;
