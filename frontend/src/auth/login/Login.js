import React, {
    useEffect,
    useRef,
    useState,
} from 'react';

import axios from 'axios';
import {
    ethers,
    utils,
} from 'ethers';

import { useWeb3React } from '@web3-react/core';

import { networkParams } from '../../utils/networkParam';
import { walletConnector } from '../../utils/walletConnector';
import LoginModal from '../login-modal/LoginModal';
import SignupModal from '../signup-modal/SignupModal';

function Login(props) {
    // integrate web3-react
    const {
        library,
        chainId,
        account,
        active,
        activate,
        deactivate,
        error,
    } = useWeb3React();

    // connected wallet account
    const [walletProvider, setWalletProvider] = useState(null);
    const [walletAccount, setWalletAccount] = useState(null);
    const [walletSigner, setWalletSigner] = useState(null);
    const [walletNetwork, setWalletNetwork] = useState(null);

    // if the user has logged in with the wallet account
    const [isLogged, setIsLogged] = useState(false);
    const isLoggedLog = useRef(false);
    const propsLogoutLog = useRef(props.logout);
    const propsReactIsLoggedLog = useRef(props.reactIsLogged);
    useEffect(() => {
        console.log(`isLogged: ${isLogged}, props.logout: ${props.logout}, props.reactIsLogged: ${props.reactIsLogged}`);

        if (!isLoggedLog.current && isLogged && !props.logout && !props.reactIsLogged) {
            console.log('LOGIN');
            props.callback_isLogged(
                walletProvider,
                walletAccount,
                walletSigner,
                walletNetwork,
                isLogged);
        } else if (!propsLogoutLog.current && props.logout && isLoggedLog.current && isLogged) {
            logout();
        }
        isLoggedLog.current = isLogged;
        propsLogoutLog.current = props.logout;
        propsReactIsLoggedLog.current = props.reactIsLogged;
    }, [isLogged, props.logout, props.reactIsLogged]);

    let logout = () => {
        deactivate(); //hook!
        console.log('deactivate done');

        window.localStorage.setItem("wallet", undefined);
        setWallet('undefined');
        eraseCookie(walletAccount); //delete cookie with the name(wallet account)

        setOnAuthenticate(false);

        setWalletProvider(null);
        setWalletAccount(null);
        setWalletSigner(null);
        setWalletNetwork(null);
        setIsLogged(false);

        props.callback_Logout();
    };

    // Check JWT for the wallet account
    const [onAuthenticate, setOnAuthenticate] = useState(false);
    useEffect(() => {
        console.log(`onAuthenticate: ${onAuthenticate}`);
    }, [onAuthenticate])
    const authenticate = () => {
        setOnAuthenticate(true);

        const JWT = getCookie(walletAccount); //Get JWT Cookie with the name(wallet account)

        JWT
            ? sendIsLogged() //If JWT Cookie is set
            : generateKeyHash() //If JWT Cookie is missing
    }
    const sendIsLogged = () => {
        axios({
            method: 'post',
            url: '/api/m1/auth/isLogged',
            data: {
                address: walletAccount
            }
        })
            .then(response => {
                response.data.success
                    ? loginSuccess(false)
                    : generateKeyHash()
            })
            .catch(error => {
                console.log('isLogged Error', error)
                if (error.response.status == 401) {
                    generateKeyHash();
                }
            });
    };
    const loginSuccess = async (newCookie) => {
        const signed = await isSigned();
        console.log('signed: ', signed);
        if (!signed) return false

        if (newCookie) {
            createCookie(walletAccount, true);
        }

        window.localStorage.setItem("wallet", walletMethod);
        setIsLogged(true);
    };
    const generateKeyHash = async () => {
        const keyClear = await getKeyClear();
        walletSign(keyClear).then(keyHash => {
            keyHash
                ? sendKeyHash(keyHash, keyClear) //If keyHash exists send it to BE to verify
                : setOnAuthenticate(false) //, console.log('keyHash is missing')]
        })
    };
    // get secret key to sign in from the server
    const getKeyClear = async () => {
        let key = null;

        await axios({
            method: 'post',
            url: '/api/m1/auth/getKeyClear',
            data: {
                address: walletAccount
            }
        })
            .then(response => {
                const res = response.data
                if (res.success) {
                    key = res.data.key;
                }
            })
            .catch(error => {
                console.log('getKeyClear Error', error);
            });

        return key;
    };
    const sendKeyHash = (keyHash, keyClear) => {
        // console.log('sendKeyHash... ', keyHash)

        let keyHashIsValid = false;

        // console.log('checking if keyHash is valid...')
        const keyHashVerify = utils.verifyMessage(keyClear, keyHash);

        console.log('sendKeyHash', keyHashVerify, walletAccount);

        keyHashVerify.toLowerCase() == walletAccount.toLowerCase()
            ? keyHashIsValid = true //[console.log('keyHash is valid... ', keyHashVerify)]
            : null //console.log('keyHash is not valid... ', keyHashVerify)

        if (keyHashIsValid) {
            axios.post('/api/m1/auth/sendKeyHash', {
                address: walletAccount,
                keyHash: keyHash,
            }
            )
                .then(response => {
                    // console.log("response_keyHash: ", response);
                    response.data.success
                        ? loginSuccess(true)
                        : setOnAuthenticate(false)
                })
            // .catch(error => console.error('Error axios.sendKeyHash: ', error))
        }
    }
    const walletSign = async (message = "ERROR") => {
        const signer = walletSigner;
        let signature = null;

        if (message != "ERROR") {
            try {
                signature = await signer.signMessage(message);
            } catch (err) {
                console.log('signMessage Error', err);
                logout();
            }
            return signature;
        } else {
            logout();
        }
    }

    // switch to signup page
    const [onSignUp, setOnSignUp] = useState(false);
    // check if the account is already signed
    const isSigned = async () => {
        let signed = false;

        await axios.post('/api/m1/auth/isSigned', {
            address: account
        })
            .then(response => {
                const res = response.data
                signed = res.success
            })
            .catch(error => {
                console.log('isSigned Error', error);
            });

        if (!signed) {
            // switch to signup page
            setOnSignUp(true);
        }

        return signed;
    };
    // sign up with the result of captcha
    const signUp = (captcha) => {
        console.log('signUp', walletAccount, captcha);
        axios.post('/api/m1/auth/signUp', {
            address: walletAccount,
            captcha: captcha,
        })
            .then(response => {
                const res = response.data;
                if (res.success) {
                    loginSuccess(true, walletAccount);
                    setOnSignUp(false);
                }
            })
            .catch(error => {
                console.log('signUp Error', error);
            })
    };

    useEffect(() => {
        error && console.log('Web3React Error', error);
        error && logout();
    }, [error])

    const [wallet, setWallet] = useState(null)
    useEffect(() => {
        console.log('first of page load');
        const orgWallet = window.localStorage.getItem("wallet");
        console.log('wallet method: ', orgWallet);
        setWallet(orgWallet);
        if (orgWallet && orgWallet != 'undefined') {
            setWalletMethod(orgWallet);
            console.log('activate start');
            if (orgWallet == 'injected') {
                activateInjectedProvider('MetaMask');
            } else if (orgWallet == 'coinbaseWallet') {
                activateInjectedProvider('CoinBase');
            }
            activate(walletConnector[orgWallet]);
            // wallet value : injected, walletConnect, coinbaseWallet
        } else {
            // if you want to connect coinbaseWallet by default, please uncomment the below code line
            // activate(walletConnector.coinbaseWallet);
        }
    }, [activate]);

    // wallet select handler
    const [walletMethod, setWalletMethod] = useState('')
    let walletSelect = (walletType) => {
        console.log('walletSelect', walletType);
        if (walletType == 'cbw') {
            setWalletMethod('coinbaseWallet');
            activateInjectedProvider('CoinBase');
            activate(walletConnector.coinbaseWallet);
        } else if (walletType == 'mm') {
            setWalletMethod('injected');
            activateInjectedProvider('MetaMask');
            activate(walletConnector.injected);
        } else if (walletType == 'wc') {
            setWalletMethod('walletConnect');
            activate(walletConnector.walletConnect);
        }
    }
    const activateInjectedProvider = (providerName) => {
        const { ethereum } = window;
        console.log('providers', ethereum?.providers);

        if (!ethereum?.providers) {
            return;
        }
        let provider;
        switch (providerName) {
            case 'CoinBase':
                provider = ethereum.providers.find(({ isCoinbaseWallet }) => isCoinbaseWallet);
                break;
            case 'MetaMask':
                provider = ethereum.providers.find(({ isMetaMask }) => isMetaMask);
                break;
        }
        console.log('selected provider', provider);
        if (provider) {
            ethereum.setSelectedProvider(provider);
        }
    }

    useEffect(() => {
        const getNetwork = async () => {
            const provider = new ethers.providers.Web3Provider(window.ethereum, "any");

            const network = await provider.getNetwork();
            return network;
        }
        const { ethereum } = window;
        if (ethereum && ethereum.on && active) {
            const provider = new ethers.providers.Web3Provider(window.ethereum, "any");

            console.log('provider', provider);
            setWalletProvider(provider);

            getNetwork().then((network) => {
                console.log('network', network);
                setWalletNetwork(network);
            })

            console.log('wallet method', walletMethod);
            if (walletMethod == 'injected') {
                const signer = provider.getSigner();
                console.log('signer', signer);
                setWalletSigner(signer);
            } else {
                const signer = library.getSigner();
                console.log('signer', signer);
                setWalletSigner(signer);
            }

            console.log('account', account);
            setWalletAccount(account);

            if (chainId != props.serverConfig.blockchain.network.chainId) {
                switchNetwork();
            }

            // handlers
            const handleConnect = () => {
                console.log("Handling 'connect' event")
            }
            const handleChainChanged = (newChainId) => {
                console.log("Chain changed", newChainId, walletMethod);
                if (newChainId != props.serverConfig.blockchain.network.chainId) {
                    logout();
                }
            }
            const handleAccountsChanged = (accounts) => {
                console.log("Handling 'accountsChanged' event with payload", accounts)
                logout();
            }
            const handleNetworkChanged = (networkId) => {
                console.log("Handling 'networkChanged' event with payload", networkId)
                // this doesn't happen usually
                logout();
                window.location.reload();
            }

            ethereum.on('connect', handleConnect)
            ethereum.on('chainChanged', handleChainChanged)
            ethereum.on('accountsChanged', handleAccountsChanged)
            ethereum.on('networkChanged', handleNetworkChanged)

            return () => {
                if (ethereum.removeListener) {
                    ethereum.removeListener('connect', handleConnect)
                    ethereum.removeListener('chainChanged', handleChainChanged)
                    ethereum.removeListener('accountsChanged', handleAccountsChanged)
                    ethereum.removeListener('networkChanged', handleNetworkChanged)
                }
            }
        }
    }, [active, chainId, account, walletMethod])

    // error which is caused when switch/add chain-network
    const [customError, setCustomError] = useState(null)
    useEffect(() => {
        customError && console.log('Error while switch/add network: ', customError);
        customError && logout();
    }, [customError])
    // switch network from serverConfig, if no network add.
    const switchNetwork = async () => {
        try {
            await library.provider.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId: utils.hexValue(props.serverConfig.blockchain.network.chainId) }]
            });
        } catch (switchError) {
            if (switchError.code === 4902) {
                try {
                    await library.provider.request({
                        method: "wallet_addEthereumChain",
                        params: [networkParams[utils.hexValue(props.serverConfig.blockchain.network.chainId)]]
                    });
                } catch (addError) {
                    setCustomError(addError);
                }
            } else {
                setCustomError(switchError);
            }
        }
    };

    useEffect(() => {
        if (active && walletProvider && walletAccount && walletSigner && walletNetwork && chainId == props.serverConfig.blockchain.network.chainId && !onAuthenticate) {
            console.log('authenticate begin', walletNetwork);
            authenticate();
        }
    }, [active, walletProvider, walletAccount, walletSigner, walletNetwork, walletMethod, chainId, onAuthenticate])

    // Cookie CRUD
    const createCookie = (name, value, days) => {
        let expires;
        if (days) {
            let date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toGMTString();
        } else {
            expires = "";
        }
        document.cookie = name + "=" + value + expires + "; path=/";
    };
    const getCookie = (c_name) => {
        let c_start; let c_end;

        if (document.cookie.length > 0) {
            c_start = document.cookie.indexOf(c_name + "=");
            if (c_start != -1) {
                c_start = c_start + c_name.length + 1;
                c_end = document.cookie.indexOf(";", c_start);
                if (c_end == -1) {
                    c_end = document.cookie.length;
                }
                return decodeURI(document.cookie.substring(c_start, c_end));
            }
        }
        return "";
    };
    const eraseCookie = (name) => {
        document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/;';
    };

    return (
        <div>
            {
                window.ethereum ?
                    isLogged ?
                        null

                        //Account is on Signup
                        : onSignUp ?
                            <SignupModal onActionClick={signUp} />

                            //Account is NOT Logged & NOT From a Redirect
                            : !props.forwardFromComponent ?
                                <LoginModal
                                    serverConfig={props.serverConfig}
                                    serverInfo={props.serverInfo}
                                    onWalletSelect={walletSelect}
                                    walletMethod={wallet}
                                    onAuthenticate={onAuthenticate}
                                />

                                : props.forwardFromComponent ?
                                    <div className="game-on-loading">
                                        <div className="sk-cube-grid">
                                            <div className="sk-cube sk-cube1"></div>
                                            <div className="sk-cube sk-cube2"></div>
                                            <div className="sk-cube sk-cube3"></div>
                                            <div className="sk-cube sk-cube4"></div>
                                            <div className="sk-cube sk-cube5"></div>
                                            <div className="sk-cube sk-cube6"></div>
                                            <div className="sk-cube sk-cube7"></div>
                                            <div className="sk-cube sk-cube8"></div>
                                            <div className="sk-cube sk-cube9"></div>
                                        </div>
                                    </div>

                                    //Error
                                    :
                                    <LoginModal
                                        error='Something gone wrong...'
                                        serverConfig={props.serverConfig}
                                        serverInfo={props.serverInfo}
                                        onWalletSelect={walletSelect}
                                        walletMethod={wallet}
                                        onAuthenticate={onAuthenticate}
                                    />
                    :
                    <LoginModal
                        error='Install Coinbase Wallet or Metamask!'
                        serverConfig={props.serverConfig}
                        serverInfo={props.serverInfo}
                        onWalletSelect={walletSelect}
                        walletMethod={wallet}
                        onAuthenticate={onAuthenticate}
                    />
            }
        </div>
    )
}

export default Login