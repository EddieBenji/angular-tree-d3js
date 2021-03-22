import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import * as d3 from 'd3';
import * as dataJson from '../../assets/data.json';

@Component({
    selector: 'app-collapsible-tree-tooltip',
    templateUrl: './collapsible-tree-tooltip.component.html',
    styleUrls: [ './collapsible-tree-tooltip.component.scss' ]
})
export class CollapsibleTreeTooltipComponent implements AfterViewInit {

    @ViewChild('chart4', { static: true }) private chartContainer: ElementRef;

    data: any = (dataJson as any).default;
    name: any;
    root: any;
    svg: any;
    nodeGroupTooltip: any;
    nodeGroupContextMenu: any;
    margin = { top: 30, right: 10, bottom: 30, left: 20 };
    width = 960;
    barHeight = 30;
    barRadius = 15;
    widthAndDepth = 140;
    barWidth = this.widthAndDepth * 0.8;
    barDepth = this.widthAndDepth + 40;
    verticalSpace = 15;
    tooltip = { width: 200, height: 24, textMargin: 5 };

    element: any;
    duration = 400;
    nodes: any[];
    i = 0;

    constructor() {
    }

    ngAfterViewInit(): void {
        this.renderTreeChart();
    }

    getSelectedItem(mouseEvent, d): void {
        this.name = d.data.name;
    }

    renderTreeChart(): void {

        this.element = this.chartContainer.nativeElement;
        this.svg = d3.select(this.element).append('svg')
          .attr('width', this.element.offsetWidth) // + margin.left + margin.right)
          .attr('height', this.element.offsetHeight)
          .attr('id', 'chart4svg')
          .append('g')
          .attr('class', 'nodes')
          .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');

        this.nodeGroupTooltip = d3.select('svg#chart4svg').append('g')
          .attr('class', 'tooltip-group')
          .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');

        this.nodeGroupContextMenu = d3.select('svg#chart4svg').append('g')
          .attr('class', 'context-group')
          .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');

        // open close context menu
        d3.select('body').on('click.context-menu-g', () => {
            d3.selectAll('.context-menu-g').style('display', 'none');
        });

        this.root = d3.hierarchy(this.data);
        this.root.x0 = 0;
        this.root.y0 = 0;
        this.collapseChildrenByParentNode(this.root);
        this.update(this.root);

    }

    customDiagonal(d: any): string {
        return 'M' + (d.source.y + this.barWidth) + ',' + d.source.x
          + 'C' + ((this.barWidth / 2) + (d.source.y + d.target.y) / 2) + ',' + d.source.x
          + ' ' + ((this.barWidth / 2) + (d.source.y + d.target.y) / 2) + ',' + d.target.x
          + ' ' + d.target.y + ',' + d.target.x;
    }

    diagonalCurvedPath(s, d): string {
        return `M ${s.y} ${s.x}
            C ${(s.y + d.y) / 2} ${s.x},
              ${(s.y + d.y) / 2} ${d.x},
              ${d.y} ${d.x}`;
    }

    // Toggle children on click.
    click = (mouseEvent, d) => {
        this.resetRootPath(d);
        // remove the selection from the leaf node:
        d3.selectAll('.node').select('rect').classed('selected-node', false);

        if (d.children) {
            d._children = d.children;
            d.children = null;
        } else {
            d.children = d._children;
            d._children = null;
        }
        // add the selection to the new leaf node selected:
        d3.selectAll('.node').select(`rect.${this.getNodeId(d)}`).classed('selected-node', true);

        // If the node has a parent, then collapse its child nodes except for this clicked node.
        if (d.parent) {
            d.parent.children.forEach((element) => {
                if (d.data.name !== element.data.name) {
                    this.collapseChildrenByParentNode(element);
                }
            });
        }

        this.update(d);
        setTimeout(() => {
            const tooltip = d3.selectAll('.tooltip-g');
            tooltip.transition()
              .duration(this.duration)
              .attr('transform', (diag: any) => {
                  return 'translate(' + diag.y + ',' + diag.x + ')';
              });

            d3.selectAll('.tooltip-g rect').attr('visibility', 'hidden');
            d3.selectAll('.tooltip-g text').attr('visibility', 'hidden');
        }, 500);

    };

    update(source): void {
        // Compute the flattened node list.
        this.nodes = this.root.descendants();
        const height = Math.max(500, this.nodes.length * this.barHeight * 2 + this.margin.top + this.margin.bottom);
        // for the first 2 levels, no need of recalculating the width. When we're at the 3rd level, then we will start recalculating the
        // width.
        const width = (source.depth < 3 ? 0 : source.depth) * 180 + this.element.offsetWidth;

        d3.select('svg#chart4svg').transition()
          .duration(this.duration)
          .attr('height', height)
          .attr('width', width);

        d3.select(self.frameElement).transition()
          .duration(this.duration)
          .style('height', height + 'px')
          .attr('width', `${height}px`);

        // Compute the "layout". TODO https://github.com/d3/d3-hierarchy/issues/67
        let index = - 1;
        // tslint:disable-next-line:only-arrow-functions
        this.root.eachBefore((d): void => {
            ++ index;
            let setXAxis = index * (this.barHeight + this.verticalSpace);

            // top left tree view from root
            if (d.depth > 0 && index > 0) {
                setXAxis = setXAxis - (this.barHeight + this.verticalSpace);
            }

            if (d.depth > 1 && index > 0) {
                setXAxis = setXAxis - (this.barHeight + this.verticalSpace);
            }

            if (d.depth > 2 && index > 0) {
                setXAxis = setXAxis - (this.barHeight + this.verticalSpace);
            }

            d.x = setXAxis;
            d.y = d.depth * this.barDepth;
        });

        // Update the nodes…
        const node = this.svg.selectAll('g.node')
          .data(this.nodes, (d) => d.id || (d.id = ++ this.i));

        const nodesTooltip = this.nodeGroupTooltip.selectAll('g')
          .data(this.nodes, (d) => d.id || (d.id = ++ this.i));

        const nodesContextMenu = this.nodeGroupContextMenu.selectAll('g')
          .data(this.nodes, (d) => d.id || (d.id = ++ this.i));

        const nodeEnter = node.enter().append('g')
          // let nodeEnter = node.enter().insert('g', 'g.node')
          .attr('class', 'node')
          .attr('transform', (d) => {
              return 'translate(' + source.y0 + ',' + source.x0 + ')';
          })
          .style('opacity', 0);

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

        // Enter any new nodes at the parent's previous position.
        nodeEnter.append('rect')
          .attr('class', (d) => {
              return this.getNodeId(d);
          })
          .attr('y', - this.barHeight / 2)
          .attr('height', this.barHeight)
          .attr('width', this.barWidth)
          .style('fill', this.color)
          .style('rx', this.barRadius)
          .on('mouseover', this.mouseover)
          // .on("mouseup", this.mouseup)
          .on('mousemove', this.mousemove)
          .on('mouseout', this.mouseout)
          .on('contextmenu', this.contextmenu)
          .on('click', this.click);

        nodeEnter.append('text')
          .attr('dy', 5)
          .attr('dx', 15)
          .style('fill', this.fontColor)
          .text((d: any) => {
              return d.data.name;
          });

        // Tooltip group
        nodeEnterTooltip.append('rect')
          .attr('id', (d: any) => {
              return 'nodeInfoID' + d.id;
          })
          .attr('x', 120)
          .attr('y', - 12)
          .attr('rx', 12)
          .attr('width', (d: any) => {
              const container = d3.select(this.element).append('svg');
              container.append('text')
                .attr('x', - 99999)
                .attr('y', - 99999)
                .text(d.data.tooltip.toString());
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
              return d.data.tooltip;
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
              return d.data.contextMenu.title;
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
              + d.data.contextMenu.subContent + '</span></div>'
              + '<div data-type="contextMenu" class="menu-heading"><b data-type="contextMenu">Heading</b></div>'
              + '<div data-type="contextMenu" class="menu-content">Content <span data-type="contextMenu">' + d.data.contextMenu.content + '</span></div>'
              + '<div data-type="contextMenu" class="menu-sub-content">Content <span data-type="contextMenu">--</span></div>'
              + '</div>';
        });

        // Transition nodes to their new position.
        nodeEnter.transition()
          .duration(this.duration)
          .attr('transform', (d: any) => {
              return 'translate(' + d.y + ',' + d.x + ')';
          })
          .style('opacity', 1);

        // Transition tooltip to their new position.
        nodeEnterTooltip.transition()
          // nodesTooltip.transition()
          .duration(this.duration)
          .attr('transform', (d: any) => {
              return 'translate(' + d.y + ',' + d.x + ')';
          });
        // .style("opacity", 1);

        // Transition context to their new position.
        nodeEnterContextMenu.transition()
          .duration(this.duration)
          .attr('transform', (d: any) => {
              return 'translate(' + d.y + ',' + d.x + ')';
          });

        node.transition()
          .duration(this.duration)
          .attr('transform', (d: any) => {
              return 'translate(' + d.y + ',' + d.x + ')';
          })
          .style('opacity', 1)
          .select('rect')
          .style('fill', this.color);

        node.transition()
          .duration(this.duration)
          .attr('transform', (d: any) => {
              return 'translate(' + d.y + ',' + d.x + ')';
          })
          .style('opacity', 1)
          .select('text')
          .style('fill', this.fontColor);

        // Transition exiting nodes to the parent's new position.
        node.exit().transition()
          .duration(this.duration)
          .attr('transform', (d: any) => {
              return 'translate(' + source.y + ',' + source.x + ')';
          })
          .style('opacity', 0)
          .remove();

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

        // Update the links…
        const link = this.svg.selectAll('.linkChart4')
          .data(this.root.links(), (d: any) => {
              return d.target.id;
          });

        // Enter any new links at the parent's previous position.
        link.enter().insert('path', 'g')
          .attr('class', 'linkChart4')
          .style('fill', 'none')
          .style('stroke', '#ccc')
          .style('stroke-width', '1px')
          .attr('d', (d) => {
              const o = { x: source.x0, y: source.y0 };
              return this.customDiagonal({ source: o, target: o } as any);
          })
          .transition()
          .duration(this.duration)
          .attr('d', this.customDiagonal.bind(this));

        d3.selectAll('path.linkChart4').style('stroke', (d: any) => {
            if (d.target.color) {
                return d.target.color;
            } else {
                return '#ccc';
            }
        });

        d3.selectAll('path.linkChart4').style('stroke-width', (d: any) => {
            if (d.target.strokeWidth) {
                return d.target.strokeWidth;
            } else {
                return '1px';
            }
        });

        // Transition links to their new position.
        link.transition()
          .duration(this.duration)
          .attr('d', this.customDiagonal.bind(this));

        // Transition exiting nodes to the parent's new position.
        link.exit().transition()
          .duration(this.duration)
          .attr('d', (d) => {
              const o = { x: source.x, y: source.y };
              return this.customDiagonal({ source: o, target: o } as any);
          })
          .remove();

        // Stash the old positions for transition.
        this.root.each((d: any) => {
            d.x0 = d.x;
            d.y0 = d.y;
        });
    }

    private getNodeId(source): string {
        return `${source.data.name}-${source.id}`;
    }

    color(d): string {
        if (d.parent != null) {
            return d._children ? '#fff' : d.children ? '#00BE4F' : '';
        }
        return '#00BE4F';
    }

    fontColor(d): string {
        if (d.parent != null) {
            return d._children ? '#000' : d.children ? '#fff' : '';
        }
        return '#fff';
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

    resetRootPath(d): void {

        let findRoot = d;
        while (findRoot.parent) {
            findRoot = findRoot.parent;
        }
        this.doResetPath(findRoot);

        let find = d;
        while (find.parent) {
            find.color = '00BE4F';
            find.strokeWidth = '3';
            find = find.parent;
        }
    }

    // Returns a list of all nodes under the root.
    // https://stackoverflow.com/questions/19423396/d3-js-how-to-make-all-the-nodes-collapsed-in-collapsible-indented-tree
    doResetPath(d): void {
        if (d.children) {
            d.children.forEach((c): void => {
                this.doResetPath(c);
            });
            d.color = undefined;
            d.strokeWidth = undefined;
        }
        d.color = undefined;
        d.strokeWidth = undefined;
    }

    mouseover(mouseEvent, d): void {
        const tooltip = d3.selectAll('.tooltip-g');
        tooltip.transition()
          .duration(this.duration)
          .attr('transform', (d: any): string => {
              return 'translate(' + d.y + ',' + d.x + ')';
          });

        d3.selectAll('.tooltip-g rect').attr('visibility', 'hidden');
        d3.selectAll('.tooltip-g text').attr('visibility', 'hidden');
        d3.select('#nodeInfoID' + d.id).attr('visibility', 'visible');
        d3.select('#nodeInfoTextID' + d.id).attr('visibility', 'visible');
    }

    mousemove(mouseEvent, d): void {
        const tooltip = d3.selectAll('.tooltip-g');
        tooltip.transition()
          .duration(this.duration)
          .attr('transform', (d: any): string => {
              return 'translate(' + d.y + ',' + d.x + ')';
          });

        d3.selectAll('.tooltip-g rect').attr('visibility', 'hidden');
        d3.selectAll('.tooltip-g text').attr('visibility', 'hidden');
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
