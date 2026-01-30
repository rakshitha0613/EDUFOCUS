class MindMapper {
    constructor() {
        this.maps = [];
        this.currentMap = null;
        this.init();
    }

    init() {
        this.loadMaps();
        this.setupListeners();
        this.renderMaps();
    }

    setupListeners() {
        document.getElementById('createMapBtn')?.addEventListener('click', () => this.openMapModal());
        document.getElementById('mapForm')?.addEventListener('submit', (e) => this.createMap(e));
        document.getElementById('closeMapModal')?.addEventListener('click', () => this.closeMapModal());

        document.getElementById('addNodeBtn')?.addEventListener('click', () => this.openNodeModal());
        document.getElementById('nodeForm')?.addEventListener('submit', (e) => this.addNode(e));
        document.getElementById('closeNodeModal')?.addEventListener('click', () => this.closeNodeModal());
        document.getElementById('exportMapBtn')?.addEventListener('click', () => this.exportMap());
    }

    openMapModal() {
        document.getElementById('mapModal').style.display = 'block';
    }

    closeMapModal() {
        document.getElementById('mapModal').style.display = 'none';
        document.getElementById('mapForm').reset();
    }

    createMap(e) {
        e.preventDefault();

        const map = {
            id: Date.now(),
            title: document.getElementById('mapTitle').value,
            description: document.getElementById('mapDescription').value,
            nodes: [
                {
                    id: 'root',
                    label: document.getElementById('mapTitle').value,
                    level: 0,
                    children: []
                }
            ],
            createdDate: new Date().toISOString(),
            lastModified: new Date().toISOString()
        };

        this.maps.push(map);
        this.saveMaps();
        this.closeMapModal();
        this.renderMaps();
    }

    openNodeModal() {
        document.getElementById('nodeModal').style.display = 'block';
    }

    closeNodeModal() {
        document.getElementById('nodeModal').style.display = 'none';
        document.getElementById('nodeForm').reset();
    }

    selectMap(mapId) {
        this.currentMap = this.maps.find(m => m.id === mapId);
        document.getElementById('mapsList').style.display = 'none';
        document.getElementById('mapContent').style.display = 'block';
        this.renderMapEditor();
    }

    backToMapsList() {
        this.currentMap = null;
        document.getElementById('mapsList').style.display = 'block';
        document.getElementById('mapContent').style.display = 'none';
        this.renderMaps();
    }

    addNode(e) {
        e.preventDefault();

        const nodeName = document.getElementById('nodeName').value;
        const parentId = document.getElementById('parentNode').value || 'root';
        const nodeColor = document.getElementById('nodeColor').value;

        const newNode = {
            id: Date.now().toString(),
            label: nodeName,
            color: nodeColor,
            level: this.getNodeLevel(parentId) + 1,
            children: []
        };

        const parentNode = this.findNode(this.currentMap.nodes[0], parentId);
        if (parentNode) {
            parentNode.children.push(newNode.id);
            this.currentMap.nodes.push(newNode);
        }

        this.currentMap.lastModified = new Date().toISOString();
        this.saveMaps();
        this.closeNodeModal();
        this.renderMapEditor();
    }

    renderMapEditor() {
        const content = document.getElementById('mapContent');
        
        content.innerHTML = `
            <div class="map-editor-header">
                <button class="btn-back" onclick="mindMapper.backToMapsList()">← Back</button>
                <h2>${this.currentMap.title}</h2>
                <div class="editor-actions">
                    <button id="addNodeBtn" class="btn-primary">➕ Add Node</button>
                    <button id="exportMapBtn" class="btn-secondary">📥 Export</button>
                </div>
            </div>

            <div class="map-canvas" id="mapCanvas">
                <svg id="mindMapSvg" style="width: 100%; height: 600px; border: 1px solid var(--border-color);"></svg>
            </div>

            <div class="map-sidebar">
                <h3>📋 Map Structure</h3>
                <div class="nodes-tree" id="nodesList">
                    ${this.renderNodeTree(this.currentMap.nodes[0])}
                </div>
            </div>
        `;

        document.getElementById('addNodeBtn')?.addEventListener('click', () => this.openNodeModal());
        document.getElementById('exportMapBtn')?.addEventListener('click', () => this.exportMap());

        // Update parent node selector
        if (document.getElementById('parentNode')) {
            document.getElementById('parentNode').innerHTML = `
                <option value="root">Central Concept</option>
                ${this.currentMap.nodes.map(n => `<option value="${n.id}">${n.label}</option>`).join('')}
            `;
        }

        // Render the mind map visualization
        this.visualizeMap();
    }

    renderNodeTree(node, indent = 0) {
        const children = this.currentMap.nodes.filter(n => node.children.includes(n.id));
        const html = `
            <div class="tree-node" style="margin-left: ${indent * 20}px">
                <div class="node-item">
                    <span class="node-label" style="background-color: ${node.color || '#6c5ce7'}; color: white; padding: 5px 10px; border-radius: 4px;">
                        ${node.label}
                    </span>
                    ${node.id !== 'root' ? `<button class="btn-delete-node" onclick="mindMapper.deleteNode('${node.id}')">🗑</button>` : ''}
                </div>
                ${children.length > 0 ? children.map(child => this.renderNodeTree(child, indent + 1)).join('') : ''}
            </div>
        `;
        return html;
    }

    visualizeMap() {
        const svg = document.getElementById('mindMapSvg');
        if (!svg) return;

        svg.innerHTML = '';
        const root = this.currentMap.nodes[0];
        const centerX = 400;
        const centerY = 300;

        // Draw root node
        this.drawNode(svg, centerX, centerY, root, 0);

        // Draw child branches
        const children = this.currentMap.nodes.filter(n => root.children.includes(n.id));
        children.forEach((child, index) => {
            const angle = (index * 360 / children.length) * Math.PI / 180;
            const x = centerX + 150 * Math.cos(angle);
            const y = centerY + 150 * Math.sin(angle);

            // Draw line
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', centerX);
            line.setAttribute('y1', centerY);
            line.setAttribute('x2', x);
            line.setAttribute('y2', y);
            line.setAttribute('stroke', '#a29bfe');
            line.setAttribute('stroke-width', '2');
            svg.appendChild(line);

            this.drawNode(svg, x, y, child, 1);
        });
    }

    drawNode(svg, x, y, node, level) {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', x);
        circle.setAttribute('cy', y);
        circle.setAttribute('r', '35');
        circle.setAttribute('fill', node.color || '#6c5ce7');
        circle.setAttribute('stroke', '#fff');
        circle.setAttribute('stroke-width', '2');
        svg.appendChild(circle);

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', x);
        text.setAttribute('y', y);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('dominant-baseline', 'middle');
        text.setAttribute('fill', 'white');
        text.setAttribute('font-size', '12');
        text.setAttribute('font-weight', 'bold');
        text.textContent = node.label.substring(0, 10);
        svg.appendChild(text);
    }

    deleteNode(nodeId) {
        if (nodeId === 'root') return;
        
        this.currentMap.nodes = this.currentMap.nodes.filter(n => n.id !== nodeId);
        
        // Remove from parent's children array
        this.currentMap.nodes.forEach(n => {
            n.children = n.children.filter(id => id !== nodeId);
        });

        this.saveMaps();
        this.renderMapEditor();
    }

    findNode(node, id) {
        if (node.id === id) return node;
        
        for (let childId of node.children) {
            const child = this.currentMap.nodes.find(n => n.id === childId);
            const result = this.findNode(child, id);
            if (result) return result;
        }
        return null;
    }

    getNodeLevel(nodeId) {
        const node = this.currentMap.nodes.find(n => n.id === nodeId);
        return node ? node.level : 0;
    }

    exportMap() {
        const mapData = {
            title: this.currentMap.title,
            description: this.currentMap.description,
            nodes: this.currentMap.nodes,
            exportDate: new Date().toISOString()
        };

        const json = JSON.stringify(mapData, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.currentMap.title}_mindmap.json`;
        a.click();
        URL.revokeObjectURL(url);

        // Also export as text
        const textExport = this.mapToText(this.currentMap.nodes[0], 0);
        const textBlob = new Blob([textExport], { type: 'text/plain' });
        const textUrl = URL.createObjectURL(textBlob);
        const textA = document.createElement('a');
        textA.href = textUrl;
        textA.download = `${this.currentMap.title}_mindmap.txt`;
        textA.click();
        URL.revokeObjectURL(textUrl);
    }

    mapToText(node, indent = 0) {
        const children = this.currentMap.nodes.filter(n => node.children.includes(n.id));
        let text = '  '.repeat(indent) + '• ' + node.label + '\n';
        
        children.forEach(child => {
            text += this.mapToText(child, indent + 1);
        });
        
        return text;
    }

    renderMaps() {
        const container = document.getElementById('mapsList');
        if (!container) return;

        container.innerHTML = `
            <div class="maps-header">
                <h2>🧠 Mind Maps</h2>
                <button id="createMapBtn" class="btn-primary">➕ Create Mind Map</button>
            </div>
            <div class="maps-grid">
                ${this.maps.map(map => `
                    <div class="map-card" onclick="mindMapper.selectMap(${map.id})">
                        <h3>${map.title}</h3>
                        <p>${map.description}</p>
                        <div class="map-card-stats">
                            <span>📊 ${map.nodes.length} concepts</span>
                            <span>📅 ${new Date(map.createdDate).toLocaleDateString()}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        document.getElementById('createMapBtn')?.addEventListener('click', () => this.openMapModal());
    }

    saveMaps() {
        localStorage.setItem('mindMaps', JSON.stringify(this.maps));
    }

    loadMaps() {
        const saved = localStorage.getItem('mindMaps');
        this.maps = saved ? JSON.parse(saved) : [];
    }
}

// Global reference
let mindMapper;

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('mapsList')) {
        mindMapper = new MindMapper();
    }
});
