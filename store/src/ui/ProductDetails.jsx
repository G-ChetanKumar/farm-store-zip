const cartItem = {
  id: product._id,
  title: product.title,
  sub_title: product.sub_title,
  mfg_by: product.mfg_by,
  imageUrl: product.imageUrl,
  source: 'e-store',
  variant: {
    originalPrice: pkg.mrp_price,
    price: pkg.sell_price,
    quantity: newQuantity,
    packageId: pkg._id,
    packageName: pkg.pkgName,
    packageQty: pkg.qty,
    mfgDate: pkg.mfg_date,
    expDate: pkg.exp_date,
    source: 'e-store'
  },
}; 