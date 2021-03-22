import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as d3 from 'd3';

interface HierarchyDatum {
    name: string;
    value: number;
    children?: Array<HierarchyDatum>;
}

const data: HierarchyDatum = {
    name: 'A1',
    value: 100,
    children: [
        {
            name: 'B1',
            value: 100,
            children: [
                {
                    name: 'C1',
                    value: 100,
                    children: undefined
                },
                {
                    name: 'C2',
                    value: 300,
                    children: [
                        {
                            name: 'D1',
                            value: 100,
                            children: undefined
                        },
                        {
                            name: 'D2',
                            value: 300,
                            children: undefined
                        }
                    ]
                },
                {
                    name: 'C3',
                    value: 200,
                    children: undefined
                }
            ]
        },
        {
            name: 'B2',
            value: 200,
            children: [
                {
                    name: 'C4',
                    value: 100,
                    children: undefined
                },
                {
                    name: 'C5',
                    value: 300,
                    children: undefined
                },
                {
                    name: 'C6',
                    value: 200,
                    children: [
                        {
                            name: 'D3',
                            value: 100,
                            children: undefined
                        },
                        {
                            name: 'D4',
                            value: 300,
                            children: undefined
                        }
                    ]
                }
            ]
        }
    ]
};

@Component({
    selector: 'app-collapsible-tree',
    templateUrl: './collapsible-tree.component.html',
    styleUrls: [ './collapsible-tree.component.scss' ]
})
export class CollapsibleTreeComponent implements OnInit {
    title = 'd3tree';
    @ViewChild('chart', { static: true }) private chartContainer: ElementRef;

    root: any;
    tree: any;
    treeLayout: any;
    svg: any;
    nodeGroupTooltip: any;
    tooltip = { width: 200, height: 24, textMargin: 5 };
    tooltipPosition = { top: 170, left: - 50 };

    treeData: any;

    height: number;
    width: number;
    margin: any = { top: 200, bottom: 90, left: 100, right: 90 };
    duration = 500;
    nodeWidth = 5;
    nodeHeight = 5;
    nodeRadius = 5;
    horizontalSeparationBetweenNodes = 5;
    verticalSeparationBetweenNodes = 5;

    dragStarted: boolean;
    draggingNode: any;
    nodes: any[];

    selectedNodeByClick: any;
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

        // Assigns parent, children, height, depth
        this.root = d3.hierarchy(data, (d) => d.children);
        this.root.x0 = this.height / 2;
        this.root.y0 = 10;

        this.updateChart(this.root);

    }

    click = (mouseEvent, nodeData) => {
        console.log('click');
        if (nodeData.children) {
            nodeData._children = nodeData.children;
            nodeData.children = null;
        } else {
            nodeData.children = nodeData._children;
            nodeData._children = null;
        }
        this.updateChart(nodeData);
    };

    updateChart(source): void {
        let i = 0;
        this.treeData = this.tree(this.root);
        this.nodes = this.treeData.descendants();
        this.links = this.treeData.descendants().slice(1);
        this.nodes.forEach((d) => {
            d.y = d.depth * 180;
        });

        const node = this.svg.selectAll('g.node')
          .data(this.nodes, (d) => d.id || (d.id = ++ i));

        const nodesTooltip = this.nodeGroupTooltip.selectAll('g')
          .data(this.nodes, (d) => d.id || (d.id = ++ i));

        const nodeEnter = node.enter().append('g')
          .attr('class', 'node')
          .attr('transform', (d) => {
              return 'translate(' + source.y0 + ',' + source.x0 + ')';
          })
          .on('mouseover', this.mouseover.bind(this))
          .on('mousemove', this.mousemove.bind(this))
          .on('mouseout', this.mouseout.bind(this))
          .on('click', this.click);

        const nodeEnterTooltip = nodesTooltip.enter().append('g')
          .attr('class', 'tooltip-g')
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
          .style('font', '12px sans-serif')
          .text((d) => d.data.name);

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
          .style('fill', (d) => {
              return d._children ? 'lightsteelblue' : '#fff';
          })
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

        nodeEnterTooltip.exit().transition().duration(this.duration)
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

}
