interface ServicesSectionProps {
  services: {
    category: string;
    items: {
      name: string;
      price: string;
    }[];
  }[];
}

export function ServicesSection({ services }: ServicesSectionProps) {
  return (
    <div className="bg-card rounded-2xl p-6">
      <h2 className="text-lg font-semibold mb-6">Services</h2>

      <div className="space-y-6">
        {services.map((serviceGroup) => (
          <div key={serviceGroup.category}>
            <h3 className="font-medium text-foreground mb-3">
              {serviceGroup.category}
            </h3>
            <div className="space-y-2">
              {serviceGroup.items.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-muted-foreground">{item.name}</span>
                  <span className="text-foreground font-medium">
                    {item.price}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
