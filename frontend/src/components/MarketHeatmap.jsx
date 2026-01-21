import React, { useState, useEffect } from 'react';
import { Chart } from "react-google-charts";
import axios from 'axios';

const MarketHeatmap = () => {
    const [marketData, setMarketData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMarketData = async () => {
            try {
                // In a real app, we fetch global market data
                // Since our current mock API returns a list, we reuse that.
                const { data } = await axios.get('http://localhost:5001/api/market/prices');

                // Format for Google Charts TreeMap
                // [ID, Parent, Size (MarketCap), Color (Change)]
                const treeMapData = [
                    ["ID", "Parent", "Market Cap ($ Billion)", "24h Change (%)"],
                    ["Crypto", null, 0, 0], // Root
                ];

                // Mocking Market Cap since our mock API doesn't have it yet
                const mockCaps = {
                    'btc': 850,
                    'eth': 400,
                    'sol': 65,
                    'ada': 18,
                    'xrp': 30,
                    'doge': 12,
                    'dot': 9,
                    'link': 8,
                    'matic': 7,
                    'ltc': 5
                };

                data.forEach(coin => {
                    treeMapData.push([
                        coin.name,
                        "Crypto",
                        mockCaps[coin.symbol] || 5, // Default small if unknown
                        coin.price_change_percentage_24h
                    ]);
                });

                setMarketData(treeMapData);
            } catch (error) {
                console.error("Error loading heatmap data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMarketData();
    }, []);

    const options = {
        minColor: "#dc2626", // Rich Red
        midColor: "#1e293b", // Dark Slate
        maxColor: "#16a34a", // Rich Green
        headerHeight: 0,
        fontColor: "#f8fafc",
        fontSize: 15,
        showScale: true,
        textStyle: {
            fontName: 'Inter, sans-serif',
            fontSize: 14,
            bold: true,
            color: '#f8fafc'
        },
        generateTooltip: (row, size, value) => {
            return `<div style="background:#fff; padding:12px; border-radius:8px; border:1px solid #e2e8f0; box-shadow:0 4px 6px -1px rgba(0,0,0,0.1); font-family:'Inter', sans-serif; color:#0f172a; min-width:150px;">
                <b style="font-size:1.1em; display:block; margin-bottom:4px;">${marketData[row + 1][0]}</b>
                <div style="color:#64748b; font-size:0.9em; margin-bottom:2px;">Cap: $${size}B</div>
                <div style="font-weight:600; color:${value >= 0 ? '#16a34a' : '#dc2626'}">
                    Change: ${value > 0 ? '+' : ''}${typeof value === 'number' ? value.toFixed(2) : value}%
                </div>
            </div>`;
        }
    };

    if (loading) return <div>Loading Market Heatmap...</div>;

    return (
        <div className="heatmap-container" style={{ width: "100%", height: "100%" }}>
            <h3 style={{ margin: "0 0 1rem 0", color: "#64748b", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: "700", display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Market Heatmap
            </h3>
            <Chart
                chartType="TreeMap"
                width="100%"
                height="350px"
                data={marketData}
                options={options}
            />
        </div>
    );
};

export default MarketHeatmap;
