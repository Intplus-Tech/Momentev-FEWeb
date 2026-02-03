interface ServicesSectionProps {
  services: {
    category: string;
    items: {
      name: string;
      description?: string;
      price: string;
      tags?: string[];
      meta?: string;
    }[];
  }[];
}

export function ServicesSection({ services }: ServicesSectionProps) {
  const hasServices = services.length > 0;

  const renderPrice = (price: string) => {
    const match = price.match(/^(.*?)\s*\((.*?)\)\s*$/);
    if (match) {
      return {
        main: match[1],
        note: match[2],
      };
    }
    return { main: price, note: undefined };
  };

  const formatTag = (tag: string) =>
    tag.replace(/_/g, " ").replace(/\s+/g, " ").trim();

  return (
    <div className="bg-white rounded-2xl p-6">
      <h2 className="text-lg font-semibold mb-6">Services</h2>

      {hasServices ? (
        <div className="space-y-6">
          {services.map((serviceGroup) => (
            <div key={serviceGroup.category} className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <span>{serviceGroup.category}</span>
              </div>

              <div className="space-y-3">
                {serviceGroup.items.map((item) => {
                  const priceParts = renderPrice(item.price);
                  const tags = item.tags?.map(formatTag).filter(Boolean) || [];
                  const extraCount = Math.max(tags.length - 6, 0);
                  const visibleTags = tags.slice(0, 6);

                  return (
                    <div
                      key={item.name}
                      className="rounded-xl border border-muted-foreground/10 bg-muted/30 px-4 py-3"
                    >
                      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-foreground font-medium">
                              {item.name}
                            </span>
                            {item.meta && (
                              <span className="rounded-full bg-foreground/5 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                                {item.meta}
                              </span>
                            )}
                          </div>

                          {item.description && (
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {item.description}
                            </p>
                          )}

                          {visibleTags.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-1">
                              {visibleTags.map((tag) => (
                                <span
                                  key={tag}
                                  className="rounded-full bg-white/60 px-2 py-0.5 text-[11px] font-medium text-muted-foreground shadow-sm"
                                >
                                  {tag}
                                </span>
                              ))}
                              {extraCount > 0 && (
                                <span className="text-[11px] font-medium text-muted-foreground">
                                  +{extraCount} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col items-start md:items-end text-sm">
                          <span className="text-foreground font-semibold">
                            {priceParts.main}
                          </span>
                          {priceParts.note && (
                            <span className="text-xs text-muted-foreground">
                              {priceParts.note}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-muted-foreground/20 bg-muted/30 p-6 text-sm text-muted-foreground">
          Service details are not available for this vendor yet.
        </div>
      )}
    </div>
  );
}
