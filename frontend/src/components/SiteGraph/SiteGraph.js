
import React, { useState, useEffect } from 'react';
const queryString = require('query-string');
var urlParse = require('url-parse');

import useHttp from '../../hooks/useHttp';

import Graph from "react-graph-vis";

const backEndUrl = 'http://localhost:3002';

const SiteGraph = (props) => {

    const [graph, setGraph] = useState({ nodes: [], edges: [] });
    const [{ data }, doFetch] = useHttp(null, null);

    useEffect(() => {
        let url = queryString.parse(props.location.search).url;
        doFetch(`${backEndUrl}/crawler?url=${url}`);
    }, []);

    const selectionWidth = (width) => { return width * 2; }

    useEffect(() => {
        if (data != null) {
            let lastFinishedScan = data.lastFinishedScan;
            let nodes = Array.from(new Set(lastFinishedScan.pages.map(payload => urlParse(payload.url).host))).map(url => { return { id: url, label: url } });
            let edges = lastFinishedScan.pages.map(payload => {
                return {
                    dashes: true,
                    selectionWidth: selectionWidth,
                    arrowStrikethrough: true,
                    physics: false,
                    from: urlParse(payload.parent).host,
                    to: urlParse(payload.url).host
                }
            });

            setGraph({ nodes, edges });
        }
    }, data);

    const options = {
        layout: {
            hierarchical: true
        },
        edges: {
            hoverWidth: function (width) { return width + 1; }
        }
    };

    //TODO: show the user info about the url
    const events = {
        select: function (event) {
            var { nodes, edges } = event;
        }
    };

    return (
        <div id="test" style={{ height: '100vh' }}>
            <Graph
                graph={graph}
                options={options}
                events={events}
                getNetwork={network => {
                    //  if you want access to vis.js network api you can set the state in a parent component using this property
                }}
            />
        </div>
    );
}

export default SiteGraph;