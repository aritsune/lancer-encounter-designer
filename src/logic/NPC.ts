import NPCClass from './interfaces/NPCClass';
import { NPCSystem } from './interfaces/NPCSystem';
import NPCTemplate from './interfaces/NPCTemplate';

import _ from 'lodash';

const npcClasses: NPCClass[] = require('../../static/classes.json');
const systems: NPCSystem.Any[] = require('../../static/systems.json');
const genericSystems: NPCSystem.Any[] = require('../../static/generic_systems.json');
const templates: NPCTemplate[] = require('./templates').default;
const templateSystems: NPCSystem.Any[] = require('../../static/template_systems.json');

export default class NPC {
  npcClass: NPCClass;
  tier: 0 | 1 | 2;
  private _name?: string;

  private _pickedSystems: NPCSystem.Any[] = [];
  _templates: string[] = [];

  constructor(npcClass: NPCClass, tier?: 0 | 1 | 2) {
    this.npcClass = npcClass;
    this.tier = tier || 0;
  }

  get class_systems() {
    return systems.filter(s => s.class === this.npcClass.name);
  }

  get base_class_systems() {
    return this.class_systems.filter(s => s.base);
  }

  get optional_class_systems() {
    return this.class_systems.filter(s => !s.base);
  }

  get genericSystemsAvailable() {
    return genericSystems.filter(s => !this.pickedSystems.includes(s));
  }

  get templateSystemsAvailable() {
    return _.groupBy(
      templateSystems
        .filter(s => this._templates.includes(s.class))
        .filter(s => !this.pickedSystems.includes(s)),
      'class',
    );
  }

  get name() {
    return this._name || this.npcClass.name;
  }
  set name(name: string) {
    this._name = name;
  }

  get pickedSystems() {
    return this._pickedSystems;
  }
  pickSystem(system: NPCSystem.Any) {
    this._pickedSystems.push(system);
  }
  removeSystem(system: NPCSystem.Any) {
    this._pickedSystems = this._pickedSystems.filter(
      sys => sys.name !== system.name,
    );
  }

  get systems() {
    const preSort = this.base_class_systems.concat(this.pickedSystems);
    return _.orderBy(
      preSort,
      ['base', 'type', 'name'],
      ['desc', 'desc', 'asc'],
    );
  }

  get templates() {
    return _.compact(
      this._templates.map(templateName =>
        _.find(templates, t => t.name === templateName),
      ),
    );
  }
  get incompatibleTemplateNames() {
    return _.uniq(_.flatten(this.templates.map(t => t.incompatibleTemplates)));
  }
  incompatibleList(templateName: string) {
    return _.uniq(
      this.templates
        .filter(t => t.incompatibleTemplates.includes(templateName))
        .map(t => t.name)
        .concat(
          templates
            .find(t => t.name === templateName)!
            .incompatibleTemplates.filter(t => this._templates.includes(t)),
        ),
    );
  }

  addTemplate(templateName: string) {
    if (this.incompatibleTemplateNames.includes(templateName))
      throw new Error(`incompatible template "${templateName}"!`);
    if (this._templates.includes(templateName))
      throw new Error(`NPC already has template "${templateName}"!`);
    const template = _.find(templates, t => t.name === templateName);
    if (!template) throw new Error(`invalid template name "${templateName}"!`);
    this._templates.push(templateName);
  }
  removeTemplate(templateName: string) {
    this._templates = _.without(this._templates, templateName);
    this._pickedSystems = this._pickedSystems.filter(
      sys => sys.class !== templateName,
    );
  }

  get features() {
    return _.uniqBy(_.flatten(this.templates.map(t => t.features)), 'name');
  }

  get stats() {
    let tempStats = (_.clone(this.npcClass.stats[this.tier]) as unknown) as {
      [key: string]: number;
    };
    tempStats.structure = 1;
    tempStats.stress = 1;

    let statCaps: { [key: string]: number } = {
      armor: 4,
    };

    for (const template of this.templates) {
      if (template.statTransform) tempStats = template.statTransform(tempStats);
      if (template.statCaps) {
        for (const stat in template.statCaps) {
          const cap = template.statCaps[stat];
          if (!statCaps[stat] || cap < statCaps[stat]) {
            statCaps[stat] = cap;
          }
        }
      }
    }

    function typeGuard(s: NPCSystem.Any): s is NPCSystem.NonWeapon {
      return s.hasOwnProperty('stat_bonuses');
    }

    const systemsWithBonus = this._pickedSystems.filter(typeGuard);

    for (const _system of systemsWithBonus) {
      const system = _system as NPCSystem.NonWeapon;
      for (const stat in (system as NPCSystem.NonWeapon).stat_bonuses) {
        if (tempStats.hasOwnProperty(stat)) {
          tempStats[stat] += system.stat_bonuses![stat];
        }
      }
    }

    for (const stat in tempStats) {
      if (statCaps[stat] && statCaps[stat] < (tempStats as any)[stat]) {
        tempStats = {
          ...tempStats,
          [stat]: statCaps[stat],
        };
      }
    }

    return tempStats;
  }

  serialize() {
    return {
      class: this.npcClass.name,
      tier: this.tier,
      name: this._name,
      templates: this._templates,
      systems: this._pickedSystems.map(s => s.name),
    };
  }

  static deserialize(obj: {
    class: string;
    tier: 0 | 1 | 2;
    name?: string;
    templates: string[];
    systems: string[];
  }) {
    const cl = npcClasses.find(c => c.name === obj.class);
    if (!cl) throw new Error('invalid class');
    let npc = new NPC(cl, obj.tier);
    npc.tier = obj.tier;
    if (obj.name) npc.name = obj.name;
    npc._templates = obj.templates;
    for (const sysName of obj.systems) {
      const sys = systems.concat(genericSystems).find(s => s.name === sysName);
      if (!sys) throw new Error(`invalid system ${sysName}`);
      npc.pickSystem(sys);
    }
    return npc;
  }
}
