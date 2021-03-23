import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as d3 from 'd3';
import * as dataJson from '../../assets/data-for-collapsible.json';

interface HierarchyDatum {
    name: string;
    value: number;
    children?: Array<HierarchyDatum>;
}

const data: HierarchyDatum = (dataJson as any).default;

@Component({
    selector: 'app-collapsible-tree',
    templateUrl: './collapsible-tree.component.html',
    styleUrls: [ './collapsible-tree.component.scss' ]
})
export class CollapsibleTreeComponent implements OnInit {
    @ViewChild('chart', { static: true }) private chartContainer: ElementRef;

    root: any;
    tree: any;
    svg: any;
    // Tooltip attributes:
    nodeGroupTooltip: any;
    tooltip = { width: 200, height: 24, textMargin: 5 };
    tooltipPosition = { top: 500, left: - 30 };

    // context menu attributes:
    nodeGroupContextMenu: any;
    nameFromContextMenu: string;
    contextMenuPosition = { xAxis: 0, yAxis: 500 };
    heightOfContextMenu = 230;

    treeData: any;

    height: number;
    width: number;
    margin: any = { top: 300, bottom: 90, left: 100, right: 90 };
    duration = 500;
    nodeWidth = 5;
    nodeHeight = 1;
    horizontalSeparationBetweenNodes = 1;
    verticalSeparationBetweenNodes = 1;
    nodeHeightAfterBeingRendered = 20;

    nodes: any[];

    links: any;

    constructor() {
    }

    private hideOtherTooltipsIfAny(): void {
        const tooltip = d3.selectAll('.tooltip-g');
        tooltip.transition()
          .duration(this.duration)
          .attr('transform', (diag: any) => {
              return 'translate(' + diag.y + ',' + diag.x + ')';
          });

        d3.selectAll('.tooltip-g rect').attr('visibility', 'hidden');
        d3.selectAll('.tooltip-g text').attr('visibility', 'hidden');
    }

    ngOnInit(): void {
        this.renderTreeChart();
        setTimeout(() => {
            this.hideOtherTooltipsIfAny();
        }, 500);
    }

    renderTreeChart(): void {

        const element: any = this.chartContainer.nativeElement;
        this.width = element.offsetWidth - this.margin.left - this.margin.right;
        this.height = element.offsetHeight - this.margin.top - this.margin.bottom;

        this.svg = d3.select(element).append('svg')
          .attr('width', element.offsetWidth)
          .attr('height', element.offsetHeight)
          .attr('id', 'chartSvgContainer')
          .append('g')
          .attr('class', 'nodes')
          .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');

        // declares a tree layout and assigns the size
        this.tree = d3.tree()
          // .size([ this.height, this.width ])
          .nodeSize([ this.nodeWidth + this.horizontalSeparationBetweenNodes, this.nodeHeight + this.verticalSeparationBetweenNodes ])
          .separation((a, b) => a.parent === b.parent ? 5 : 10);

        // Tooltip:
        this.nodeGroupTooltip = d3.select('svg#chartSvgContainer').append('g')
          .attr('class', 'tooltip-group')
          .attr('transform', 'translate(' + this.tooltipPosition.left + ',' + this.tooltipPosition.top + ')');

        // Right click:
        this.nodeGroupContextMenu = d3.select('svg#chartSvgContainer').append('g')
          .attr('class', 'context-group')
          .attr('transform', 'translate(' + this.contextMenuPosition.xAxis + ',' + this.contextMenuPosition.yAxis + ')');

        // close context menu if clicked outside of it.
        d3.select('body').on('click.context-menu-g', () => {
            d3.selectAll('.context-menu-g').style('display', 'none');
        });

        // Assigns parent, children, height, depth
        this.root = d3.hierarchy(data);
        this.root.x0 = this.height / 2;
        this.root.y0 = 10;

        // this.collapseChildrenByParentNode(this.root);
        this.updateChart(this.root);

    }

    getSelectedItem(mouseEvent, d): void {
        this.nameFromContextMenu = d.data.name;
    }

    isNodeCollapsed(node): boolean {
        // node._children !== null and node._children !== undefined means the node was collapsed.
        return node._children !== null && node._children !== undefined;
    }

    isLeafNode(node): boolean {
        return (node.children === null || node.children === undefined) && (node._children === null || node._children === undefined);
    }

    fillColorForNode(node: any): string {
        if (this.isNodeCollapsed(node)) {
            return 'lightsteelblue';
        }
        // everytime a node is clicked, we set the attribute 'clicked' to true. Otherwise is false or undefined.
        return node.clicked ? 'red' : '#fff';
    }

    updateColorOfParents(node): void {
        do {
            node.clicked = !node.clicked;
            node = node.parent;
        } while (node);
    }

    areParentsSameAsNode(node, valueToUpdate: boolean): boolean {
        do {
            if (node.clicked === valueToUpdate) {
                return false;
            }
            node = node.parent;
        } while (node);
        return true;
    }

    click = (mouseEvent, nodeData) => {
        if (nodeData.children) {
            nodeData._children = nodeData.children;
            nodeData.children = null;
        } else {
            nodeData.children = nodeData._children;
            nodeData._children = null;
        }
        const newClickedValue = !nodeData.clicked;
        if (this.isLeafNode(nodeData) && this.areParentsSameAsNode(nodeData, newClickedValue)) {
            nodeData.clicked = newClickedValue;
            // change the color of all the parents as well.
            this.updateColorOfParents(nodeData.parent);
        }
        this.updateChart(nodeData);
        setTimeout(() => {
            this.hideOtherTooltipsIfAny();
        }, 500);
    };

    // https://stackoverflow.com/questions/19423396/d3-js-how-to-make-all-the-nodes-collapsed-in-collapsible-indented-tree
    collapseChildrenByParentNode(d): void {
        if (d.children) {
            d.children.forEach((c): void => {
                this.collapseChildrenByParentNode(c);
            });
            d._children = d.children;
            d.children = null;
        }
    }

    updateChart(source): void {
        let i = 0;
        this.treeData = this.tree(this.root);
        this.nodes = this.treeData.descendants();
        this.links = this.treeData.descendants().slice(1);
        let maxDepth = 1;
        this.nodes.forEach((d) => {
            d.y = d.depth * 180;
            if (d.depth > maxDepth) {
                maxDepth = d.depth;
            }
        });
        let multiplicationFactor = data.children.length;
        if (this.root.id === source.id && !this.root.children) {
            // then we're changing the root node and we're collapsing it. Therefore, the height should be decreased!
            multiplicationFactor = 0;
            this.height = 0;
        }
        const rawNodeHeights = multiplicationFactor * this.nodeHeightAfterBeingRendered * 1.5;
        // consider also the height of the context menu, so for the last leaf node it gets rendered:
        this.height = Math.max(this.height, rawNodeHeights + this.margin.top + this.margin.bottom + this.heightOfContextMenu);
        this.width = (maxDepth - 1) * 180 + (this.chartContainer.nativeElement.offsetWidth - this.margin.left - this.margin.right);
        const mainSvgSection = d3.select('svg#chartSvgContainer');

        mainSvgSection.transition()
          .duration(this.duration)
          .attr('width', this.width)
          .attr('height', this.height);

        const node = this.svg.selectAll('g.node')
          .data(this.nodes, (d) => d.id || (d.id = ++ i));

        const nodesTooltip = this.nodeGroupTooltip.selectAll('g')
          .data(this.nodes, (d) => d.id || (d.id = ++ i));

        const centerOfTheChart = this.height / 2;
        // Update tooltip position in the entire tree:
        mainSvgSection.select('g.tooltip-group')
          .attr('transform', 'translate(' + this.tooltipPosition.left + ',' + (centerOfTheChart - 25) + ')');

        // Update context menu position in the entire tree:
        mainSvgSection.select('g.context-group')
          .attr('transform', 'translate(' + this.contextMenuPosition.xAxis + ',' + centerOfTheChart + ')');
        const nodesContextMenu = this.nodeGroupContextMenu.selectAll('g')
          .data(this.nodes, (d) => d.id || (d.id = ++ i));

        // Adjust the margin top:
        mainSvgSection.select('g')
          .attr('transform', 'translate(' + this.margin.left + ',' + centerOfTheChart + ')');

        const nodeEnter = node.enter().append('g')
          .attr('class', 'node')
          .attr('transform', (d) => {
              return 'translate(' + source.y0 + ',' + source.x0 + ')';
          })
          .on('mouseover', this.mouseover.bind(this))
          .on('mousemove', this.mousemove.bind(this))
          .on('mouseout', this.mouseout.bind(this))
          .on('contextmenu', this.contextmenu.bind(this))
          .on('click', this.click.bind(this));

        const nodeEnterTooltip = nodesTooltip.enter().append('g')
          .attr('class', 'tooltip-g')
          .attr('transform', (d) => {
              return 'translate(' + source.y0 + ',' + source.x0 + ')';
          });

        const nodeEnterContextMenu = nodesContextMenu.enter().append('g')
          .attr('class', 'context-menu-g')
          .attr('id', (d: any) => {
              return 'nodeContextMenuGroup' + d.id;
          })
          .style('display', 'none')
          .attr('transform', (d) => {
              return 'translate(' + source.y0 + ',' + source.x0 + ')';
          });

        nodeEnter.append('circle')
          .attr('class', 'node')
          .attr('r', 1e-6)
          .style('fill', (d) => {
              return d._children ? 'lightsteelblue' : '#fff';
          });

        nodeEnter.append('text')
          .attr('dy', '.35em')
          .attr('x', (d) => {
              return d.children || d._children ? - 13 : 13;
          })
          .attr('text-anchor', (d) => {
              return d.children || d._children ? 'end' : 'start';
          })
          .style('font', '12px sans-serif');
        // .text((d) => d.data.name);

        // Tooltip group
        nodeEnterTooltip.append('rect')
          .attr('id', (d: any) => {
              return 'nodeInfoID' + d.id;
          })
          .attr('x', 120)
          .attr('y', - 12)
          .attr('rx', 12)
          .attr('width', (d: any) => {
              const container = d3.select(this.chartContainer.nativeElement).append('svg');
              container.append('text')
                .attr('x', - 99999)
                .attr('y', - 99999)
                .text(`${d.data.name.toString()}--`);
              const size = container.node().getBBox();
              container.remove();
              return size.width;
          })
          .attr('height', this.tooltip.height)
          .attr('class', 'tooltip-rect')
          .style('fill-opacity', 1)
          .attr('visibility', 'hidden');

        nodeEnterTooltip.append('text')
          .attr('id', (d: any) => {
              return 'nodeInfoTextID' + d.id;
          })
          .attr('x', 128)
          .attr('y', 4)
          .attr('class', 'tooltip-text')
          .attr('visibility', 'hidden')
          .append('tspan')
          .text((d: any) => {
              return d.data.name;
          });

        // ContextMenu group
        nodeEnterContextMenu.append('rect')
          .attr('id', (d: any) => {
              return 'nodeContextMenuID' + d.id;
          })
          .attr('x', 120)
          .attr('y', - 12)
          .attr('rx', 12)
          .attr('width', 250)
          .attr('height', 200)
          .attr('class', 'context-menu-rect')
          .attr('data-type', 'contextMenu')
          .style('fill-opacity', 1);

        nodeEnterContextMenu.append('text')
          .attr('id', (d: any) => {
              return 'nodeContextMenuTextID' + d.id;
          })
          .attr('x', 135)
          .attr('y', 12)
          .attr('class', 'context-menu-title')
          .attr('data-type', 'contextMenu')
          .on('click', this.getSelectedItem.bind(this)) // in here we need to pass the context this, in order to attach the name to the
          // property from this component.
          .style('fill', '#000')
          .text((d: any) => {
              return d.data.name;
          });

        nodeEnterContextMenu.append('foreignObject')
          .attr('x', 135)
          .attr('y', 18)
          .attr('width', 220)
          .attr('height', 200)
          .attr('data-type', 'contextMenu')
          .append('xhtml').html((d) => {
            return '<div class="node-text wordwrap" data-type="contextMenu">'
              + '<div class="divider" data-type="contextMenu"></div>'
              + '<div data-type="contextMenu" class="menu-heading"><b data-type="contextMenu">Heading</b></div>'
              + '<div data-type="contextMenu" class="menu-content">Content <span data-type="contextMenu">--</span></div>'
              + '<div data-type="contextMenu" class="menu-sub-content">Content <span data-type="contextMenu">'
              + '</div>';
        });

        const nodeUpdate = nodeEnter.merge(node);

        nodeUpdate.transition()
          .duration(this.duration)
          .attr('transform', (d) => {
              return 'translate(' + d.y + ',' + d.x + ')';
          });

        nodeUpdate.select('circle.node')
          .attr('r', 10)
          .style('stroke-width', '3px')
          .style('stroke', 'steelblue')
          .style('fill', this.fillColorForNode.bind(this))
          .attr('cursor', 'pointer');

        const nodeExit = node.exit().transition()
          .duration(this.duration)
          .attr('transform', (d) => {
              return 'translate(' + source.y + ',' + source.x + ')';
          })
          .remove();

        // Transition tooltip to their new position.
        nodeEnterTooltip.transition()
          // nodesTooltip.transition()
          .duration(this.duration)
          .attr('transform', (d: any) => {
              return 'translate(' + d.y + ',' + d.x + ')';
          });

        // Transition context to their new position.
        nodeEnterContextMenu.transition()
          .duration(this.duration)
          .attr('transform', (d: any) => {
              return 'translate(' + d.y + ',' + d.x + ')';
          });

        nodeEnterTooltip.exit().transition().duration(this.duration)
          .attr('transform', (d: any) => {
              return 'translate(' + source.y + ',' + source.x + ')';
          })
          .remove();

        nodeEnterContextMenu.exit().transition().duration(this.duration)
          .attr('transform', (d: any) => {
              return 'translate(' + source.y + ',' + source.x + ')';
          })
          .remove();

        nodeExit.select('circle')
          .attr('r', 1e-6);

        nodeExit.select('text')
          .style('fill-opacity', 1e-6);

        const link = this.svg.selectAll('path.link')
          .data(this.links, (d) => d.id);

        const linkEnter = link.enter().insert('path', 'g')
          .attr('class', 'link')
          .style('fill', 'none')
          .style('stroke', '#ccc')
          .style('stroke-width', '2px')
          .attr('d', (d) => {
              const o = { x: source.x0, y: source.y0 };
              return diagonal(o, o);
          });

        const linkUpdate = linkEnter.merge(link);

        linkUpdate.transition()
          .duration(this.duration)
          .attr('d', (d) => diagonal(d, d.parent));

        const linkExit = link.exit().transition()
          .duration(this.duration)
          .attr('d', (d) => {
              const o = { x: source.x, y: source.y };
              return diagonal(o, o);
          })
          .remove();

        this.nodes.forEach((d) => {
            d.x0 = d.x;
            d.y0 = d.y;
        });

        function diagonal(s, d): string {
            return `M ${s.y} ${s.x}
                  C ${(s.y + d.y) / 2} ${s.x},
                  ${(s.y + d.y) / 2} ${d.x},
                  ${d.y} ${d.x}`;
        }
    }

    mouseover(mouseEvent, d): void {
        this.hideOtherTooltipsIfAny();
        d3.select('#nodeInfoID' + d.id).attr('visibility', 'visible');
        d3.select('#nodeInfoTextID' + d.id).attr('visibility', 'visible');
    }

    mousemove(mouseEvent, d): void {
        this.hideOtherTooltipsIfAny();
        d3.select('#nodeInfoID' + d.id).attr('visibility', 'visible');
        d3.select('#nodeInfoTextID' + d.id).attr('visibility', 'visible');
    }

    mouseout(mouseEvent, d): void {
        d3.selectAll('.tooltip-g rect').attr('visibility', 'hidden');
        d3.selectAll('.tooltip-g text').attr('visibility', 'hidden');
    }

    contextmenu(mouseEvent, nodeData: any): void {
        const contextMenu = d3.selectAll('.context-menu-g');
        contextMenu.transition()
          .duration(this.duration)
          .attr('transform', (d: any): string => {
              return 'translate(' + d.y + ',' + d.x + ')';
          });

        d3.selectAll('.context-menu-g').style('display', 'none');
        d3.select('#nodeContextMenuGroup' + nodeData.id).style('display', 'block');
        mouseEvent.preventDefault();
    }

}
