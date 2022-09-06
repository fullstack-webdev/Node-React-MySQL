import React, { Component } from 'react';

import NFT from '../../components/nft/NFT'

import './nfts.scss';

class NFTs extends Component {
    render(){
        return (
        <div className='nfts'>
                <h2>{this.props.headline}</h2>
                <div className='container'>
                    <ul>
                        <NFT type='townhall'/>
                        <NFT type='lumberjack'/>
                        <NFT type='stonemine'/>
                        <NFT type='lands'/>
                        <NFT type='goldmine'/>
                    </ul>
                </div>
        </div>
        )
    }
}

export default NFTs