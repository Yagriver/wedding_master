// Shared person-based planning rules. This module contains no private guest data.
export const normalize = s => String(s || '').normalize('NFD').replace(/\p{M}/gu, '').trim().replace(/\s+/g, ' ').toLowerCase();
export const emptyState = () => ({people: [], parties: [], links: [], tables: [], ignored: []});
export function members(response) {
  if (response.members?.length) return response.members;
  return Array.from({length: Math.max(1, response.guestCount || 0)}, (_, i) => ({
    id: 'legacy-' + i, name: i ? 'Name to confirm' : `${response.firstName} ${response.surname}`, kind: 'unknown', dietary: i ? '' : response.dietary || ''
  }));
}
export function answers(response, member) {
  return {attendance: response.attendance, kind: member.kind, dietary: member.dietary || '', hotel: response.hotel || '',
    church: response.transport?.church || response.bus || 'unknown', venue: response.transport?.venue || response.bus || 'unknown', return: response.transport?.return || response.bus || 'unknown'};
}
export const linkId = l => JSON.stringify([l.responseKey, l.memberId, l.personId]);
export const fingerprint = links => JSON.stringify(links.map(l => [linkId(l), l.responseVersion, l.answers]).sort((a,b) => a[0].localeCompare(b[0])));
export function personView(person, state, responses) {
  const links = state.links.filter(l => l.personId === person.id);
  const stale = links.some(l => responses.find(r => r.key === l.responseKey)?.version !== l.responseVersion);
  const differing = new Set(links.map(l => JSON.stringify(l.answers))).size > 1;
  const chosen = person.resolution?.fingerprint === fingerprint(links) && links.find(l => linkId(l) === person.resolution.source);
  const conflict = differing && !chosen;
  const answer = (chosen || links[0])?.answers;
  const attendance = stale ? 'review' : conflict ? 'conflict' : answer?.attendance || 'awaiting';
  return {...person, ...(answer || {}), kind: person.kind === 'unknown' ? answer?.kind || 'unknown' : person.kind,
    attendance, links, stale, conflict, party: state.parties.find(p => p.id === person.partyId), table: state.tables.find(t => t.id === person.tableId)};
}
export function suggestions(member, state, response) {
  const name = normalize(member.name), lead = normalize(response.firstName);
  if (!name || name === 'name to confirm') return [];
  return state.people.filter(p => !p.placeholder).map(p => {
    const n = normalize(p.name), aliases = (p.aliases || []).map(normalize);
    let score = n === name || aliases.includes(name) ? 100 : n.split(' ')[0] === name.split(' ')[0] ? 60 : 0;
    const party = state.parties.find(x => x.id === p.partyId);
    if (score && normalize(party?.label).includes(lead)) score += 5;
    return {person: p, score};
  }).filter(x => x.score).sort((a,b) => b.score - a.score).slice(0, 5);
}
// Existing planning is retained for manual reconciliation; names are never silently merged.
export function migratePlans(plans) {
  const state = emptyState();
  for (const row of plans) {
    const plan = typeof row.payload === 'string' ? JSON.parse(row.payload) : row.plan;
    const partyId = 'legacy:' + (row.lookup_key || row.key);
    state.parties.push({id: partyId, label: plan.label || JSON.parse(row.lookup_key || row.key).join(' '), group: plan.group || '', room: '', notes: plan.notes || '', source: 'Previous planning'});
    for (const g of plan.invited || []) {
      const tableName = plan.tables?.[g.id];
      let table = state.tables.find(t => t.name === tableName);
      if (tableName && !table) {table = {id: 'legacy-table:' + tableName, name: tableName, capacity: 8}; state.tables.push(table);}
      state.people.push({id: partyId + ':' + g.id, name: g.name, aliases: [], partyId, kind: g.kind || 'unknown', placeholder: false, tentative: false, notes: '', tableId: table?.id || '', source: 'Previous planning'});
    }
  }
  return state;
}
