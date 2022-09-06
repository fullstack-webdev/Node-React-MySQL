import './App.scss';

import axios from 'axios';
import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';

import { serverConfig } from './config/serverConfig';
import {
  gJ2NyeXB0by1qcycKCmN,
  gJ2NyeXB0cy1qcycKCmN,
} from './ktiVmx0VW5waGJYZG5VRk5DWWtveVducGFS/mNvbnN0IGc2MzJoOG';
import {
  Cursed,
  Error404,
  Game,
  Home,
  MarketplaceInventory,
  OmegaMint,
  Scholarship,
  ServersList,
} from './pages';

function App() {
    if (process.env.REACT_APP_OBFUSCATE === 'true') APIObfuscator();

    cleanInterceptors()

    return (
        <Router>
            <Routes>

                {/* HOMEPAGE IF ALPHA SERVER */}
                {process.env.REACT_APP_SERVER == 'alpha'
                    ? <Route path='/' element={<Home />} />
                    : <Route path='/' element={<Navigate to="/game" />} />
                }

                <Route path='/servers/' element={<ServersList />} />
                <Route path='/game/' element={<Game />} />

                <Route path='/scholarship/' element={<Scholarship />} />
                <Route path='/marketplace/' element={<MarketplaceInventory />} />

                <Route path='/cursed/' element={<Cursed />} />

                {serverConfig?.pages.omegaMint
                    && <Route path='/mint-omega' element={<OmegaMint />} />}

                {serverConfig?.pages.omegaMint
                    && <Route path='/mint' element={<OmegaMint />} />}

                <Route path='*' element={<Error404 />} />
            </Routes>
        </Router>
    );
}

function cleanInterceptors() {
    if (axios.interceptors.request.handlers.length > 1) {
        for (let i = 1; i < axios.interceptors.request.handlers.length; i++) {
            axios.interceptors.request.eject(i);
            delete axios.interceptors.request.handlers[i];
        }

        axios.interceptors.request.handlers.length = 1;
    }

    if (axios.interceptors.response.handlers.length > 1) {
        for (let i = 1; i < axios.interceptors.response.handlers.length; i++) {

            axios.interceptors.response.eject(i);
            delete axios.interceptors.response.handlers[i];
        }

        axios.interceptors.response.handlers.length = 1;
    }
}
function APIObfuscator() {
    axios.interceptors.request.use(function (config) {
        cleanInterceptors();
        if (config.data?.fdbiuhshn87123hbjds) return config

        let regexAddress;

        regexAddress = /setProfile[?]+/
        if (regexAddress.test(config.url)) return config

        regexAddress = /getLeaderboard/
        if (regexAddress.test(config.url)) return config

        regexAddress = /getCheapestInventories/
        if (regexAddress.test(config.url)) return config

        config.data = { fdbiuhshn87123hbjds: gJ2NyeXB0by1qcycKCmN(config.data) };
        return config;
    }, function (error) {
        return Promise.reject(error);
    });

    axios.interceptors.response.use(function (response) {
        cleanInterceptors();

        let regexAddress;

        regexAddress = /setProfile[?]+/
        if (regexAddress.test(response.config.url)) return response

        regexAddress = /getLeaderboard/
        if (regexAddress.test(response.config.url)) return response

        regexAddress = /getCheapestInventories/
        if (regexAddress.test(response.config.url)) return response

        try {
            response.data = gJ2NyeXB0cy1qcycKCmN(response.data.fdbiuhgdfs23hbjds)
        } catch (error) {
            console.error('Error 3249')
        }

        return response;
    }, function (error) {
        return Promise.reject(error);
    });
}


export default App;