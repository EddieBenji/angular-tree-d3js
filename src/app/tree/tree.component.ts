import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';

@Component({
    selector: 'app-tree',
    templateUrl: './tree.component.html',
    styleUrls: [ './tree.component.scss' ]
})
export class TreeComponent implements OnInit {

    margins = {
        top: 20,
        bottom: 300,
        left: 30,
        right: 100
    };
    height = 600;
    width = 900;

    totalWidth = this.width + this.margins.left + this.margins.right;
    totalHeight = this.height + this.margins.top + this.margins.bottom;
    levels: any[] = [
        [
            {
                id: 'Chaos'
            }
        ],
        [
            {
                id: 'Gaea',
                parents: [ 'Chaos' ]
            },
            {
                id: 'Uranus'
            }
        ],
        [
            {
                id: 'Oceanus',
                parents: [ 'Gaea', 'Uranus' ]
            },
            {
                id: 'Thethys',
                parents: [ 'Gaea', 'Uranus' ]
            },
            {
                id: 'Pontus'
            },
            {
                id: 'Rhea',
                parents: [ 'Gaea', 'Uranus' ]
            },
            {
                id: 'Cronus',
                parents: [ 'Gaea', 'Uranus' ]
            },
            {
                id: 'Coeus',
                parents: [ 'Gaea', 'Uranus' ]
            },
            {
                id: 'Phoebe',
                parents: [ 'Gaea', 'Uranus' ]
            },
            {
                id: 'Crius',
                parents: [ 'Gaea', 'Uranus' ]
            },
            {
                id: 'Hyperion',
                parents: [ 'Gaea', 'Uranus' ]
            },
            {
                id: 'Iapetus',
                parents: [ 'Gaea', 'Uranus' ]
            },
            {
                id: 'Thea',
                parents: [ 'Gaea', 'Uranus' ]
            },
            {
                id: 'Themis',
                parents: [ 'Gaea', 'Uranus' ]
            },
            {
                id: 'Mnemosyne',
                parents: [ 'Gaea', 'Uranus' ]
            }
        ],
        [
            {
                id: 'Doris',
                parents: [ 'Oceanus', 'Thethys' ]
            },
            {
                id: 'Neures',
                parents: [ 'Pontus', 'Gaea' ]
            },
            {
                id: 'Dionne'
            },
            {
                id: 'Demeter',
                parents: [ 'Rhea', 'Cronus' ]
            },
            {
                id: 'Hades',
                parents: [ 'Rhea', 'Cronus' ]
            },
            {
                id: 'Hera',
                parents: [ 'Rhea', 'Cronus' ]
            },
            {
                id: 'Alcmene'
            },
            {
                id: 'Zeus',
                parents: [ 'Rhea', 'Cronus' ]
            },
            {
                id: 'Eris'
            },
            {
                id: 'Leto',
                parents: [ 'Coeus', 'Phoebe' ]
            },
            {
                id: 'Amphitrite'
            },
            {
                id: 'Medusa'
            },
            {
                id: 'Poseidon',
                parents: [ 'Rhea', 'Cronus' ]
            },
            {
                id: 'Hestia',
                parents: [ 'Rhea', 'Cronus' ]
            }
        ],
        [
            {
                id: 'Thetis',
                parents: [ 'Doris', 'Neures' ]
            },
            {
                id: 'Peleus'
            },
            {
                id: 'Anchises'
            },
            {
                id: 'Adonis'
            },
            {
                id: 'Aphrodite',
                parents: [ 'Zeus', 'Dionne' ]
            },
            {
                id: 'Persephone',
                parents: [ 'Zeus', 'Demeter' ]
            },
            {
                id: 'Ares',
                parents: [ 'Zeus', 'Hera' ]
            },
            {
                id: 'Hephaestus',
                parents: [ 'Zeus', 'Hera' ]
            },
            {
                id: 'Hebe',
                parents: [ 'Zeus', 'Hera' ]
            },
            {
                id: 'Hercules',
                parents: [ 'Zeus', 'Alcmene' ]
            },
            {
                id: 'Megara'
            },
            {
                id: 'Deianira'
            },
            {
                id: 'Eileithya',
                parents: [ 'Zeus', 'Hera' ]
            },
            {
                id: 'Ate',
                parents: [ 'Zeus', 'Eris' ]
            },
            {
                id: 'Leda'
            },
            {
                id: 'Athena',
                parents: [ 'Zeus' ]
            },
            {
                id: 'Apollo',
                parents: [ 'Zeus', 'Leto' ]
            },
            {
                id: 'Artemis',
                parents: [ 'Zeus', 'Leto' ]
            },
            {
                id: 'Triton',
                parents: [ 'Poseidon', 'Amphitrite' ]
            },
            {
                id: 'Pegasus',
                parents: [ 'Poseidon', 'Medusa' ]
            },
            {
                id: 'Orion',
                parents: [ 'Poseidon' ]
            },
            {
                id: 'Polyphemus',
                parents: [ 'Poseidon' ]
            }
        ],
        [
            {
                id: 'Deidamia'
            },
            {
                id: 'Achilles',
                parents: [ 'Peleus', 'Thetis' ]
            },
            {
                id: 'Creusa'
            },
            {
                id: 'Aeneas',
                parents: [ 'Anchises', 'Aphrodite' ]
            },
            {
                id: 'Lavinia'
            },
            {
                id: 'Eros',
                parents: [ 'Hephaestus', 'Aphrodite' ]
            },
            {
                id: 'Helen',
                parents: [ 'Leda', 'Zeus' ]
            },
            {
                id: 'Menelaus'
            },
            {
                id: 'Polydueces',
                parents: [ 'Leda', 'Zeus' ]
            }
        ],
        [
            {
                id: 'Andromache'
            },
            {
                id: 'Neoptolemus',
                parents: [ 'Deidamia', 'Achilles' ]
            },
            {
                id: 'Aeneas(2)',
                parents: [ 'Creusa', 'Aeneas' ]
            },
            {
                id: 'Pompilius',
                parents: [ 'Creusa', 'Aeneas' ]
            },
            {
                id: 'Iulus',
                parents: [ 'Lavinia', 'Aeneas' ]
            },
            {
                id: 'Hermione',
                parents: [ 'Helen', 'Menelaus' ]
            }
        ]
    ];
    svg: any;

    constructor() {
    }

    ngOnInit(): void {
        this.displayTheChart();
    }

    displayTheChart(): void {
        this.svg = d3.select('figure#tree')
          .append('svg')
          .attr('width', this.totalWidth)
          .attr('height', this.totalHeight);

        this.svg.append('g')
          .attr('transform', 'translate(' + this.margins.left + ',' + this.margins.top + ')');

        // precompute level depth
        this.levels.forEach((l, i) => {
            l.forEach(n => n.level = i);
        });

        // Declare the general properties the D3 needs.
        const nodes = this.levels.reduce(((a, x) => a.concat(x)), []);
        // tslint:disable-next-line:variable-name
        const nodes_index = {};
        nodes.forEach((d: any) => nodes_index[ d.id ] = d);

        // objectification
        nodes.forEach((d: any) => {
            d.parents = (d.parents === undefined ? [] : d.parents).map(p => nodes_index[ p ]);
        });

        // precompute bundles
        this.levels.forEach((l, i) => {
            const index = {};
            l.forEach((n: any) => {
                if (n.parents.length === 0) {
                    return;
                }

                const id = n.parents.map((d: any) => d.id).sort().join('--');
                if (id in index) {
                    index[ id ].parents = index[ id ].parents.concat(n.parents);
                } else {
                    index[ id ] = {
                        id,
                        parents: n.parents.slice(),
                        level: i
                    };
                }
                n.bundle = index[ id ];
            });
            l.bundles = Object.keys(index).map(k => index[ k ]);
            l.bundles.forEach((b, counter) => b.i = counter);
        });

        const links: any[] = [];
        nodes.forEach((d: any) => {
            d.parents.forEach(p => links.push({
                source: d,
                bundle: d.bundle,
                target: p
            }));
        });

        const bundles = this.levels.reduce(((a, x) => a.concat(x.bundles)), []);

        // reverse pointer from parent to bundles
        bundles.forEach((b: any) => b.parents.forEach(p => {
            if (p.bundles_index === undefined) {
                p.bundles_index = {};
            }
            if (!(b.id in p.bundles_index)) {
                p.bundles_index[ b.id ] = [];
            }
            p.bundles_index[ b.id ].push(b);
        }));

        nodes.forEach((n: any) => {
            if (n.bundles_index !== undefined) {
                n.bundles = Object.keys(n.bundles_index).map(k => n.bundles_index[ k ]);
            } else {
                n.bundles_index = {};
                n.bundles = [];
            }
            n.bundles.forEach((b, i) => b.i = i);
        });

        links.forEach((l: any) => {
            if (l.bundle.links === undefined) {
                l.bundle.links = [];
            }
            l.bundle.links.push(l);
        });

        // layout
        const padding = 8;
        // tslint:disable-next-line:variable-name
        const node_height = 22;
        // tslint:disable-next-line:variable-name
        const node_width = 70;
        // tslint:disable-next-line:variable-name
        const bundle_width = 14;
        // tslint:disable-next-line:variable-name
        const level_y_padding = 16;
        // tslint:disable-next-line:variable-name
        const metro_d = 4;
        const c = 16;
        // tslint:disable-next-line:variable-name
        const min_family_height = 16;

        nodes.forEach((n: any) => n.height = (Math.max(1, n.bundles.length) - 1) * metro_d);

        // tslint:disable-next-line:variable-name
        let x_offset = padding;
        // tslint:disable-next-line:variable-name
        let y_offset = padding;
        this.levels.forEach((l: any) => {
            x_offset += l.bundles.length * bundle_width;
            y_offset += level_y_padding;
            l.forEach((n, i) => {
                n.x = n.level * node_width + x_offset;
                n.y = node_height + y_offset + n.height / 2;

                y_offset += node_height + n.height;
            });
        });

        let i = 0;
        this.levels.forEach((l: any) => {
            l.bundles.forEach(b => {
                b.x = b.parents[ 0 ].x + node_width + (l.bundles.length - 1 - b.i) * bundle_width;
                b.y = i * node_height;
            });
            i += l.length;
        });

        links.forEach(l => {
            l.xt = l.target.x;
            l.yt = l.target.y + l.target.bundles_index[ l.bundle.id ].i * metro_d - l.target.bundles.length * metro_d / 2 + metro_d / 2;
            l.xb = l.bundle.x;
            l.xs = l.source.x;
            l.ys = l.source.y;
        });

        // compress vertical space
        // tslint:disable-next-line:variable-name
        let y_negative_offset = 0;
        this.levels.forEach((l: any) => {
            // tslint:disable-next-line:max-line-length
            const accessor = (link: any) => {
                return (link.ys - c) - (link.yt + c);
            };
            y_negative_offset += - min_family_height + d3.min(l.bundles, (b: any) => d3.min(b.links, accessor)) || 0;
            l.forEach((n: any) => n.y -= y_negative_offset);
        });

        // very ugly, I know
        links.forEach((l: any) => {
            l.yt = l.target.y + l.target.bundles_index[ l.bundle.id ].i * metro_d - l.target.bundles.length * metro_d / 2 + metro_d / 2;
            l.ys = l.source.y;
            l.c1 = l.source.level - l.target.level > 1 ? node_width + c : c;
            l.c2 = c;
        });

        const cluster = d3.cluster()
          .size([ this.width, this.height ]);

        const root = d3.hierarchy(links);
        cluster(root);
        const oValues: any = Object.values(root as any)[ 0 ];
        const linkks: any = oValues.map((x: any) => x.bundle.links);

        linkks.forEach((linkk: any) => {
            this.svg.append('g')
              .selectAll('circle')
              .data(linkk)
              .join('circle')
              .attr('cx', (d: any) => d.target.x)
              .attr('cy', (d: any) => d.target.y)
              .attr('fill', 'none')
              .attr('stroke', (d: any) => {
                  return '#' + Math.floor(16777215 * Math.sin(3 * Math.PI / (5 * (parseInt(d.target.level, 10) + 1)))).toString(16);
              })
              .attr('r', 6);
            this.svg.append('g')
              .selectAll('circle')
              .data(linkk)
              .join('circle')
              .attr('cx', (d: any) => d.source.x)
              .attr('cy', (d: any) => d.source.y)
              .attr('fill', 'none')
              .attr('stroke', (d: any) => {
                  return '#' + Math.floor(16777215 * Math.sin(3 * Math.PI / (5 * (parseInt(d.source.level, 10) + 1)))).toString(16);
              })
              .attr('r', 6);

            this.svg.append('g')
              .attr('font-family', 'sans-serif')
              .attr('font-size', 14)
              .selectAll('text')
              .data(linkk)
              .join('text')
              .attr('class', 'text')
              .attr('x', (d: any) => d.target.x + padding)
              .attr('y', (d: any) => d.target.y)
              .text((d: any) => d.target.id)
              .attr('fill', (d: any) => {
                  return '#' + Math.floor(16777215 * Math.sin(3 * Math.PI / (5 * (parseInt(d.target.level, 10) + 2)))).toString(16);
              });

            this.svg.append('g')
              .attr('font-family', 'sans-serif')
              .attr('font-size', 14)
              .selectAll('text')
              .data(linkk)
              .join('text')
              .attr('class', 'text')
              .attr('x', (d: any) => d.source.x + padding)
              .attr('y', (d: any) => d.source.y)
              .text((d: any) => d.source.id)
              .attr('fill', (d: any) => {
                  return '#' + Math.floor(16777215 * Math.sin(3 * Math.PI / (5 * (parseInt(d.source.level, 10) + 1)))).toString(16);
              });

            this.svg.append('g')
              .attr('class', 'node')
              .selectAll('path')
              .data(linkk)
              .join('path')
              .attr('class', 'link')
              .attr('d', d3.linkHorizontal()
                .source((d: any) => {
                    return [ d.xs, d.ys ];
                })
                .target((d: any) => {
                    return [ d.xt, d.yt ];
                }))
              .attr('fill', 'none')
              .attr('stroke-opacity', 0.325)
              .attr('stroke-width', 0.75)
              .attr('stroke', (d: any) => {
                  return '#' + Math.floor(16777215 * Math.sin(3 * Math.PI / (4 * parseInt(d.source.level, 10)))).toString(16);
              });
        });

    }
}
