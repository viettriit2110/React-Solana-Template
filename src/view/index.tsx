import IonIcon from '@sentre/antd-ionicon'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import {Keypair, SystemProgram } from '@solana/web3.js'
import * as Web3 from '@solana/web3.js';
import { Image, Col, Layout, Row, Space, Typography, Button } from 'antd'
import { useCallback, useEffect, useState } from 'react'

import logo from 'static/images/solanaLogo.svg'
import brand from 'static/images/solanaLogoMark.svg'
import './index.less'
import Splt from './splt';


function View() {
    const {publicKey, sendTransaction} = useWallet()
    const {connection } = useConnection()
    const [balance, setBalance] = useState(0)
    const [loading, setLoading] = useState(false)

    const getMyBalance = useCallback(async()=>{
        if(!publicKey)
            return setBalance(0)
        const lamport = await connection.getBalance(publicKey)
        return setBalance(lamport)
    },[connection,publicKey]);

    useEffect(()=> {
        getMyBalance()
    },[getMyBalance])

    const airdrop = useCallback(async () =>{
        try {
            setLoading(true)
            if(publicKey){
                await connection.requestAirdrop(publicKey,10**9);
                console.log("connection",connection)
            }
            // alert('airdrop thanh cong')
            setTimeout(() => getMyBalance(), 2000);
        } catch (er: any) {
            console.log(er.message)
        }finally{
            return setLoading(false)
        }
       
    }, [connection, publicKey,getMyBalance])

    const transfer = useCallback(async () =>{
        try {
            setLoading(true)
            if(publicKey){
                const instruction = SystemProgram.transfer({
                    fromPubkey: publicKey,
                    toPubkey: Keypair.generate().publicKey,
                    lamports: 10**8,
                });
                const transaction = new Web3.Transaction().add(instruction);
                const {
                    context: { slot: minContextSlot },
                    value: { blockhash, lastValidBlockHeight }
                } = await connection.getLatestBlockhashAndContext();
        
                const signature = await sendTransaction(transaction, connection, { minContextSlot });
                // console.log('signature' ,signature);
                await connection.confirmTransaction({ blockhash, lastValidBlockHeight, signature });
                // alert('https://explorer.solana.com/tx/'+ signature+'?cluster=devnet')
                return getMyBalance()
            }
        } catch (er: any) {
            console.log(er.message)
        }finally{
            return setLoading(false)
        }
       
    }, [connection, publicKey,getMyBalance])
    return (
        <Layout className="container">
            <Row gutter={[24, 24]}>
                <Col span={24}>
                    <Row gutter={[24, 24]}>
                        <Col flex="auto">
                            <img alt='logo' src={brand} height={16} />
                        </Col>
                        <Col>
                        <WalletMultiButton/>
                        </Col>
                    </Row>
                </Col>
                <Col span={24} style={{ textAlign: 'center' }}>
                    <Space direction="vertical" size={24}>
                        <Image src={logo} preview={false} width={256} />
                        <Typography.Title level={1}>React + Solana = DApp</Typography.Title>
                        <Typography.Text type="secondary">
                            <Space>
                                <IonIcon name="logo-react" />
                                +
                                <IonIcon name="logo-solana" />
                                =
                                <IonIcon name="rocket" />
                            </Space>
                        </Typography.Text>
                        <Typography.Title>My balance : {balance/ 10**9} SOL</Typography.Title>
                        <Space>
                            <Button type="primary" size="large" onClick={airdrop} loading = {loading}>
                                Airdrop
                            </Button>
                            <Button type="primary" size="large" onClick={transfer} loading = {loading}>
                                tranfer
                            </Button>
                        </Space>
                    </Space>
                </Col>
                <Col span= {24} style={{padding:20}} >
                    <Splt/>
                </Col>
            </Row>
        </Layout>
    )
}

export default View
