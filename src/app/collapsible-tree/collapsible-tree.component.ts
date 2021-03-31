import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as d3 from 'd3';
import * as dataJson from '../../assets/data-for-collapsible.json';

interface HierarchyRuleDatum {
    id: number;
    pattern: string;
    rulePattern: string[];
    children?: Array<HierarchyRuleDatum>;
}

const mockData: HierarchyRuleDatum = (dataJson as any).default;

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

    currentLeafNodeSelected: any;

    isLoadingTree = true;

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
        this.isLoadingTree = true;
        setTimeout(() => this.renderTreeChart());
        // setTimeout(() => {
        //     this.hideOtherTooltipsIfAny();
        // }, 500);
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
          .size([ this.height, this.width ])
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
        d3.select('body .d3-chart.container.tree').on('click.context-menu-g-show', (a) => {
            this.verifyAndCloseContextMenuIfAny();
        });

        // Assigns parent, children, height, depth
        this.root = d3.hierarchy(mockData);
        this.root.x0 = this.height / 2;
        this.root.y0 = 10;

        // this.collapseChildrenByParentNode(this.root);
        this.updateChart(this.root);
        this.isLoadingTree = false;
        // setTimeout(() => this.isLoadingTree = false);

    }

    getOpenedContextMenuIfAny(): any {
        return d3.select('.context-menu-g.context-menu-g-show');
    }

    isAnyContextMenuOpen(visibleMenu): boolean {
        return visibleMenu !== undefined && visibleMenu !== null &&
          visibleMenu.node() !== undefined && visibleMenu.node() !== null;
    }

    closeContextMenu(visibleContextMenu): void {
        // this.height -= (visibleContextMenu.node() as any).getBBox().height;
        // this.updateHeightOfMainSelection();
        visibleContextMenu.classed('context-menu-g-show', false);
    }

    private verifyAndCloseContextMenuIfAny(): void {
        const openedContextMenu = this.getOpenedContextMenuIfAny();
        if (this.isAnyContextMenuOpen(openedContextMenu)) {
            this.closeContextMenu(openedContextMenu);
        }
    }

    getSelectedItem(mouseEvent, d): void {
        this.nameFromContextMenu = d.data.pattern;
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

    updateClickedValueOnParents(node, hardValue?: boolean): void {
        while (node) {
            node.clicked = hardValue !== undefined ? hardValue : !node.clicked;
            node = node.parent;
        }
    }

    areParentsSameAsNode(node, valueToUpdate: boolean): boolean {
        while (node) {
            if (node.clicked === valueToUpdate) {
                return false;
            }
            node = node.parent;
        }
        return true;
    }

    unselectOtherNodes(): void {
        this.currentLeafNodeSelected.clicked = false;
        this.updateClickedValueOnParents(this.currentLeafNodeSelected.parent, false);
        this.currentLeafNodeSelected = undefined;
    }

    collapseNode(nodeData): void {
        if (nodeData.children) {
            nodeData._children = nodeData.children;
            nodeData.children = null;
        } else {
            nodeData.children = nodeData._children;
            nodeData._children = null;
        }
    }

    private updateClickedValueForNode(nodeData): void {
        if (!this.isLeafNode(nodeData)) {
            return;
        }
        const newClickedValue = !nodeData.clicked;
        if (newClickedValue && this.currentLeafNodeSelected?.clicked) {
            // Unselect the other nodes as there is a new leaf node selected.
            this.unselectOtherNodes();
        }
        this.currentLeafNodeSelected = nodeData;
        nodeData.clicked = newClickedValue;
        // change the color of all the parents as well.
        this.updateClickedValueOnParents(nodeData.parent);
    }

    // resetRootPath(d): void {
    //
    //     let findRoot = d;
    //     while (findRoot.parent) {
    //         findRoot = findRoot.parent;
    //     }
    //     this.doResetPath(findRoot);
    //
    //     let find = d;
    //     while (find.parent) {
    //         find.color = '00BE4F';
    //         find.strokeWidth = '3';
    //         find = find.parent;
    //     }
    // }
    //
    // // Returns a list of all nodes under the root.
    // // https://stackoverflow.com/questions/19423396/d3-js-how-to-make-all-the-nodes-collapsed-in-collapsible-indented-tree
    // doResetPath(d): void {
    //     if (d.children) {
    //         d.children.forEach((c): void => {
    //             this.doResetPath(c);
    //         });
    //         d.color = undefined;
    //         d.strokeWidth = undefined;
    //     }
    //     d.color = undefined;
    //     d.strokeWidth = undefined;
    // }

    click(mouseEvent, nodeData: d3.HierarchyNode<any>): void {
        // this.resetRootPath(nodeData);
        this.isLoadingTree = true;
        // If the node has a parent, then collapse its child nodes except for this clicked node.
        // if (nodeData.parent) {
        //     nodeData.parent.children.forEach((element) => {
        //         if (nodeData.data.name !== element.data.name) {
        //             this.collapseChildrenByParentNode(element);
        //         }
        //     });
        // }
        // this.updateChart(nodeData);
        // this.centerNode(nodeData);
        setTimeout(() => {
            this.collapseNode(nodeData);
            this.updateClickedValueForNode(nodeData);
            this.verifyAndCloseContextMenuIfAny(); // This is necessary here in order to avoid strange behavior with the vertical bar.
            this.updateChart(nodeData);
            this.hideOtherTooltipsIfAny();

            this.isLoadingTree = false;
        });
    }

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

    getTooltipValue(data: HierarchyRuleDatum): string {
        const maxLength = 20;
        if (data.pattern.length > maxLength) {
            return `${data.pattern.toString().slice(0, maxLength)}...`;
        }
        return data.pattern;
    }

    private getRawNodeHeights(nodeData: any): number {
        return this.getMultiplicationFactorForRootNode(nodeData) * this.nodeHeightAfterBeingRendered * 1.5;
    }

    private getMultiplicationFactorForRootNode(nodeData: any): number {
        let multiplicationFactor = this.nodes ? this.nodes.length : 0;
        if (this.root.id === nodeData.id && !this.root.children) {
            // then we're changing the root node and we're collapsing it. Therefore, the height should be decreased!
            multiplicationFactor = 0;
            this.height = 0;
        }
        return multiplicationFactor;
    }

    private updateHeightOfMainSelection(): void {
        d3.select('svg#chartSvgContainer')
          .transition()
          .duration(this.duration)
          .attr('height', this.height);
    }

    // centerNode(source): void {
    //     let x = - source.y0;
    //     let y = - source.x0;
    //     x = x + this.width / 2;
    //     y = y + this.height / 2;
    //     d3.select('g').transition()
    //       .duration(this.duration)
    //       .attr('transform', 'translate(' + x + ',' + y + ')');
    // }

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
        // consider also the height of the context menu, so for the last leaf node it gets rendered:
        this.height = Math.max(this.height, this.getRawNodeHeights(source) + this.margin.top + this.margin.bottom);
        this.width = (maxDepth - 1) * 180 + (this.chartContainer.nativeElement.offsetWidth - this.margin.left - this.margin.right);
        const mainSvgSection = d3.select('svg#chartSvgContainer');

        mainSvgSection
          // .transition()
          // .duration(this.duration)
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
          // .on('mousemove', this.mousemove.bind(this))
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
        // .text((d) => d.data.pattern);

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
                .text(this.getTooltipValue(d.data) + '--');
              const size = container.node().getBBox();
              container.remove();
              return size.width * .9; // TODO: need to check if this value is good enough.
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
              return this.getTooltipValue(d.data);
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
          .attr('height', (nodeWithData) => {
              return nodeWithData?.data?.rulePattern?.length > 0 ? nodeWithData.data.rulePattern.length * 14 + 150 : 150;
          })
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
              return `Node ID: ${d.data.id}`;
          });

        nodeEnterContextMenu.append('foreignObject')
          .attr('x', 135)
          .attr('y', 18)
          .attr('width', 220)
          .attr('height', (nodeWithData) => {
              return nodeWithData?.data?.rulePattern?.length > 0 ? nodeWithData.data.rulePattern.length * 14 + 200 : 200;
          })
          .attr('data-type', 'contextMenu')
          .append('xhtml').html(({ data }) => {
            const { rulePattern } = data as HierarchyRuleDatum;
            let rulePatterHtml = '';
            if (rulePattern) {
                // The root node doesn't have the rulePattern, therefore, we won't render anything there.
                for (const pattern of rulePattern) {
                    rulePatterHtml += `<div data-type="contextMenu" class="menu-sub-content"><span class="pattern-value">${pattern}</span></div>`;
                }
            }
            const baseHtml = '<div class="node-text wordwrap" data-type="contextMenu">'
              + '<div class="divider" data-type="contextMenu"></div>'
              // + '<div data-type="contextMenu" class="menu-heading"><b data-type="contextMenu">' + data.id + '</b></div>'
              + '<div data-type="contextMenu" class="menu-content"><b>Pattern:</b> <span data-type="contextMenu">' + data.pattern + '</span></div>';
            if (!rulePatterHtml) {
                return baseHtml;
            }
            return baseHtml + '<div data-type="contextMenu" class="menu-sub-content"><b>Rule Pattern</b></div>' + rulePatterHtml;
        });

        const nodeUpdate = nodeEnter.merge(node);

        nodeUpdate
          // .transition()
          // .duration(this.duration)
          .attr('transform', (d) => {
              return 'translate(' + d.y + ',' + d.x + ')';
          });

        nodeUpdate.select('circle.node')
          .attr('r', 10)
          .style('stroke-width', '3px')
          .style('stroke', 'steelblue')
          .style('fill', this.fillColorForNode.bind(this))
          .attr('cursor', 'pointer');

        const nodeExit = node.exit()
          // .transition()
          // .duration(this.duration)
          .attr('transform', (d) => {
              return 'translate(' + source.y + ',' + source.x + ')';
          })
          .remove();

        // Transition tooltip to their new position.
        nodeEnterTooltip
          .transition()
          .duration(this.duration)
          .attr('transform', (d: any) => {
              return 'translate(' + d.y + ',' + d.x + ')';
          });

        // Transition context to their new position.
        nodeEnterContextMenu
          .transition()
          .duration(this.duration)
          .attr('transform', (d: any) => {
              return 'translate(' + d.y + ',' + d.x + ')';
          });

        nodeEnterTooltip.exit()
          .transition()
          .duration(this.duration)
          .attr('transform', (d: any) => {
              return 'translate(' + source.y + ',' + source.x + ')';
          })
          .remove();

        nodeEnterContextMenu.exit()
          .transition()
          .duration(this.duration)
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

        linkUpdate
          // .transition()
          // .duration(this.duration)
          .attr('d', (d) => diagonal(d, d.parent));

        const linkExit = link.exit()
          // .transition()
          // .duration(this.duration)
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

    // mousemove(mouseEvent, d): void {
    //     this.hideOtherTooltipsIfAny();
    //     d3.select('#nodeInfoID' + d.id).attr('visibility', 'visible');
    //     d3.select('#nodeInfoTextID' + d.id).attr('visibility', 'visible');
    // }

    mouseout(mouseEvent, d): void {
        // d3.selectAll('.tooltip-g rect').attr('visibility', 'hidden');
        // d3.selectAll('.tooltip-g text').attr('visibility', 'hidden');
        d3.select('#nodeInfoID' + d.id).attr('visibility', 'hidden');
        d3.select('#nodeInfoTextID' + d.id).attr('visibility', 'hidden');
    }

    contextmenu(mouseEvent, nodeData: any): void {
        mouseEvent.preventDefault();
        const contextMenu = d3.selectAll('.context-menu-g');
        contextMenu.classed('context-menu-g-show', false);
        contextMenu
          .transition()
          .duration(this.duration)
          .attr('transform', (d: any): string => {
              return 'translate(' + d.y + ',' + d.x + ')';
          });

        d3.select('#nodeContextMenuGroup' + nodeData.id).classed('context-menu-g-show', true);
        // In the context menu, we can show multiple rule patterns, therefore, we should update the height if needed.
        // const contextMenuHeight = nodeData.data.rulePattern?.length > 0 ? nodeData.data.rulePattern.length * 14 + 150 : 150;
        // const possibleNewHeight = this.getRawNodeHeights(nodeData) + this.margin.top + this.margin.bottom + contextMenuHeight;
        // if (this.height >= possibleNewHeight) {
        //     // no need of updating the height
        //     return;
        // }
        // this.height = possibleNewHeight;
        // this.updateHeightOfMainSelection();
    }
}
