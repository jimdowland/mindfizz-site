function breadcrumbs(data) {
  const url = data.page.url || '';
  const parents = [
    ['/services/', 'Services'],
    ['/work/', 'Work'],
    ['/insights/', 'Insights']
  ];
  const parent = parents.find(([prefix]) => url.startsWith(prefix) && url !== prefix);
  if (!parent) return null;
  return [
    { name: 'Home', url: '/' },
    { name: parent[1], url: parent[0] },
    { name: data.serviceType || data.title, url }
  ];
}

module.exports = {
  breadcrumbs,
  structuredData(data) {
    const { site } = data;
    const businessId = `${site.url}/#business`;
    const url = data.canonical || `${site.url}${data.page.url}`;
    const graph = [{
      '@type': 'ProfessionalService',
      '@id': businessId,
      name: site.name,
      url: site.url,
      logo: `${site.url}/img/brand/mindfizz-wordmark-tr.png`,
      description: site.description,
      email: site.email,
      telephone: site.phone,
      areaServed: 'Worldwide',
      employee: site.team.map(person => ({ '@id': `${site.url}/experience/#${person.id}` }))
    }];
    site.team.forEach(person => graph.push({
      '@type': 'Person',
      '@id': `${site.url}/experience/#${person.id}`,
      name: person.name,
      jobTitle: person.jobTitle,
      url: `${site.url}/experience/#${person.id}`,
      sameAs: [person.profile],
      worksFor: { '@id': businessId }
    }));
    if (data.serviceType) graph.push({
      '@type': 'Service',
      '@id': `${url}#service`,
      name: data.serviceType,
      url,
      description: data.description,
      areaServed: 'Worldwide',
      provider: { '@id': businessId }
    });
    if (Array.isArray(data.tags) && data.tags.includes('insights')) {
      const article = {
        '@type': 'Article',
        '@id': `${url}#article`,
        headline: data.title,
        description: data.description,
        url,
        mainEntityOfPage: url,
        datePublished: new Date(data.date).toISOString().slice(0, 10),
        author: { '@id': businessId },
        publisher: { '@id': businessId }
      };
      if (data.updated) article.dateModified = new Date(data.updated).toISOString().slice(0, 10);
      graph.push(article);
    }
    const trail = breadcrumbs(data);
    if (trail) graph.push({
      '@type': 'BreadcrumbList',
      '@id': `${url}#breadcrumbs`,
      itemListElement: trail.map((crumb, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: crumb.name,
        item: `${site.url}${crumb.url}`
      }))
    });
    return { '@context': 'https://schema.org', '@graph': graph };
  }
};
