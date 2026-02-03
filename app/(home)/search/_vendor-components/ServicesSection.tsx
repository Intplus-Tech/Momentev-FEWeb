interface ServicesSectionProps {
  services: {
    category: string;
    items: {
      name: string;
      description?: string;
      price: string;
    }[];
  }[];
}

export function ServicesSection({ services }: ServicesSectionProps) {
  return (
    <div className="bg-white rounded-2xl p-6">
      <h2 className="text-lg font-semibold mb-6">Services</h2>

      <div className="space-y-6">
        {services.map((serviceGroup) => (
          <div key={serviceGroup.category}>
            <h3 className="font-medium text-foreground mb-3">
              {serviceGroup.category}
            </h3>
            <div className="space-y-4">
              {serviceGroup.items.map((item) => (
                <div key={item.name} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-foreground font-medium">
                      {item.name}
                    </span>
                    <span className="text-foreground font-medium">
                      {item.price}
                    </span>
                  </div>
                  {item.description && (
                    <p className="text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
