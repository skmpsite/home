import React, { useState, useEffect } from 'react';
import { SchoolProfile, FacebookPost } from '../../types';
import {
  ExternalLink,
  CheckCircle2,
  Globe,
  Wifi,
  Battery,
  Signal,
  Smartphone,
  Search,
  MessageSquare,
  ThumbsUp,
  MessageCircle,
  Share2,
  Heart,
  MoreHorizontal,
  Eye,
  X,
  Home,
  Tv,
  Users,
  Bell,
  Menu
} from 'lucide-react';
import { initialFacebookPosts } from '../../data/initialData';

interface FacebookSmartphoneSectionProps {
  profile: SchoolProfile;
}

export const FacebookSmartphoneSection: React.FC<FacebookSmartphoneSectionProps> = ({ profile }) => {
  const [posts, setPosts] = useState<FacebookPost[]>(initialFacebookPosts);
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [selectedImage, setSelectedImage] = useState<{ url: string; title: string } | null>(null);
  const [currentTime, setCurrentTime] = useState<string>('09:41');
  const [toastMsg, setToastMsg] = useState<string>('');

  // Update clock every minute for realistic smartphone status bar
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      setCurrentTime(`${hours}:${mins}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 30000);
    return () => clearInterval(timer);
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleToggleLike = (postId: string) => {
    setLikedPosts((prev) => {
      const isLiked = !prev[postId];
      setPosts((currentPosts) =>
        currentPosts.map((p) => {
          if (p.id === postId) {
            return {
              ...p,
              likesCount: isLiked ? p.likesCount + 1 : Math.max(0, p.likesCount - 1)
            };
          }
          return p;
        })
      );
      if (isLiked) {
        showToast('👍 Anda menyukai kiriman ini!');
      }
      return { ...prev, [postId]: isLiked };
    });
  };

  const handleShare = (post: FacebookPost) => {
    if (navigator.share) {
      navigator
        .share({
          title: post.author,
          text: post.content.substring(0, 100) + '...',
          url: post.postUrl
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(post.postUrl);
      showToast('🔗 Pautan Facebook disalin ke papan keratan!');
    }
  };

  const skmpPosts = posts.filter((p) => p.source === 'skmp' || !p.source);
  const ppdPosts = posts.filter((p) => p.source === 'ppdkbb');

  // Render individual Phone mockup component containing HD Full Responsive Facebook Feed
  const renderPhoneMockup = (target: 'skmp' | 'ppdkbb') => {
    const isSkmp = target === 'skmp';
    const pageTitle = isSkmp ? 'SK Merbau Pulas Rasmi' : 'PPD Kulim Bandar Baharu';
    const pageHandle = isSkmp ? '@SKMPKBA5012' : '@PPDKBB';
    const pageCategory = isSkmp ? 'Sekolah Rendah Kerajaan • KBA5012' : 'Pejabat Pendidikan Daerah • KPM';
    const pageAvatar = isSkmp
      ? profile.logoUrl
      : 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&q=80&w=200';
    const fbUrl = isSkmp
      ? 'https://www.facebook.com/SKMPKBA5012/'
      : 'https://www.facebook.com/p/PPD-Kulim-Bandar-Baharu-61553992422357/';

    const targetPosts = isSkmp ? skmpPosts : ppdPosts;

    return (
      <div className="relative mx-auto w-full max-w-[420px]">
        {/* Phone Outer Chassis with realistic volume buttons & power button */}
        <div className="relative rounded-[36px] sm:rounded-[48px] p-2 sm:p-3 bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_30px_rgba(59,130,246,0.2)] border border-slate-600/70 ring-1 ring-white/20">
          
          {/* Side Hardware Buttons Simulation */}
          <div className="hidden sm:block absolute -left-[7px] top-24 w-[4px] h-10 bg-slate-700 rounded-l-md" />
          <div className="hidden sm:block absolute -left-[7px] top-38 w-[4px] h-12 bg-slate-700 rounded-l-md" />
          <div className="hidden sm:block absolute -right-[7px] top-28 w-[4px] h-14 bg-slate-700 rounded-r-md" />

          {/* Inner Phone Screen */}
          <div className="relative rounded-[28px] sm:rounded-[40px] bg-slate-950 overflow-hidden border border-slate-800 flex flex-col h-[650px] sm:h-[720px]">
            
            {/* Top Smartphone Status Bar */}
            <div className="bg-slate-950 text-white px-4 sm:px-5 pt-2.5 sm:pt-3 pb-1.5 flex items-center justify-between text-xs font-semibold select-none flex-shrink-0 z-30">
              {/* Clock */}
              <span className="text-[11px] font-bold tracking-tight text-slate-200">{currentTime}</span>

              {/* Dynamic Island / Notch */}
              <div className="w-20 sm:w-26 h-4 sm:h-5 bg-black rounded-full flex items-center justify-between px-2 shadow-inner border border-white/10">
                <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-blue-500/80 animate-pulse"></div>
                <div className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center">
                  <div className="w-1 h-1 rounded-full bg-blue-400"></div>
                </div>
              </div>

              {/* Status Icons */}
              <div className="flex items-center gap-1.5 text-slate-300 text-[10px]">
                <Signal className="w-3 h-3 text-slate-200" />
                <Wifi className="w-3 h-3 text-slate-200" />
                <div className="flex items-center gap-0.5">
                  <span className="text-[9px] font-bold">98%</span>
                  <Battery className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                </div>
              </div>
            </div>

            {/* Facebook Mobile App Navigation Bar */}
            <div className="bg-[#1877F2] text-white px-3 sm:px-3.5 py-2 flex items-center justify-between shadow-md flex-shrink-0 z-20">
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white text-[#1877F2] font-black text-sm sm:text-lg flex items-center justify-center shadow">
                  f
                </div>
                <span className="font-black text-base tracking-tighter">facebook</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => showToast('Carian siaran diaktifkan')}
                  className="w-7 h-7 rounded-full bg-blue-800/70 hover:bg-blue-800 flex items-center justify-center text-white transition"
                  title="Cari"
                >
                  <Search className="w-3.5 h-3.5" />
                </button>
                <a
                  href={fbUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7 h-7 rounded-full bg-blue-800/70 hover:bg-blue-800 flex items-center justify-center text-white relative transition"
                  title="Buka FB Rasmi"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 text-[9px] font-extrabold rounded-full flex items-center justify-center border border-white">
                    1
                  </span>
                </a>
              </div>
            </div>

            {/* Facebook Mobile App Sub-Tabs */}
            <div className="bg-slate-900 border-b border-slate-800 px-3 py-1.5 flex items-center justify-around text-slate-400 text-xs flex-shrink-0 z-20">
              <div className="flex flex-col items-center text-[#1877F2] relative pb-0.5 cursor-pointer">
                <Home className="w-4 h-4" />
                <span className="w-6 h-0.5 bg-[#1877F2] rounded-full absolute -bottom-1.5" />
              </div>
              <div className="cursor-pointer hover:text-slate-200 transition">
                <Tv className="w-4 h-4" />
              </div>
              <div className="cursor-pointer hover:text-slate-200 transition">
                <Users className="w-4 h-4" />
              </div>
              <div className="cursor-pointer hover:text-slate-200 transition relative">
                <Bell className="w-4 h-4" />
                <span className="w-2 h-2 rounded-full bg-rose-500 absolute -top-0.5 -right-0.5" />
              </div>
              <div className="cursor-pointer hover:text-slate-200 transition">
                <Menu className="w-4 h-4" />
              </div>
            </div>

            {/* Scrollable Screen Content: HD Full Responsive News Feed Area */}
            <div className="flex-grow overflow-y-auto overflow-x-hidden bg-slate-950 text-slate-100 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
              <div className="space-y-2 pb-6">
                
                {/* Page Cover & Mini Profile Header inside Feed */}
                <div className="bg-slate-900 border-b border-slate-800 pb-3">
                  <div className="h-20 sm:h-24 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 relative">
                    <div className="absolute inset-0 bg-black/20" />
                    <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/60 backdrop-blur-sm rounded text-[9px] font-bold text-yellow-300 border border-white/10">
                      {isSkmp ? 'Laman Rasmi Sekolah' : 'PPD Kulim Bandar Baharu'}
                    </div>
                  </div>

                  <div className="px-3.5 -mt-7 sm:-mt-8 flex items-end justify-between gap-2">
                    <div className="relative">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-slate-950 p-1 border-2 border-yellow-400 shadow-xl overflow-hidden flex items-center justify-center">
                        <img
                          src={pageAvatar}
                          alt={pageTitle}
                          className="w-full h-full object-contain bg-white/10 rounded-full"
                        />
                      </div>
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-emerald-500 border-2 border-slate-950 rounded-full" />
                    </div>

                    <div className="flex items-center gap-1.5 pb-1">
                      <a
                        href={fbUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-[#1877F2] hover:bg-blue-600 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 shadow transition"
                      >
                        <span>Ikuti</span>
                        <CheckCircle2 className="w-3 h-3" />
                      </a>
                      <a
                        href={fbUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-bold flex items-center gap-1 border border-slate-700 transition"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  <div className="px-3.5 mt-2">
                    <div className="flex items-center gap-1">
                      <h4 className="font-extrabold text-sm text-white">{pageTitle}</h4>
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 fill-blue-500/20" />
                    </div>
                    <p className="text-[11px] text-yellow-300 font-bold">{pageHandle}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{pageCategory}</p>
                    
                    {/* Live Feed Status Bar */}
                    <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-300">
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        HD Live Feed (Terkini & Lengkap)
                      </span>
                      <span className="text-slate-400">{targetPosts.length} Kiriman</span>
                    </div>
                  </div>
                </div>

                {/* Create Post / Feed Status Simulation */}
                <div className="bg-slate-900 p-3 border-y border-slate-800 flex items-center gap-2.5">
                  <img
                    src={profile.logoUrl}
                    alt="Avatar"
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/10 p-0.5 border border-white/20 object-contain"
                  />
                  <div className="flex-grow bg-slate-800/80 rounded-full px-3 py-1.5 text-[11px] text-slate-400 border border-slate-700 truncate">
                    Kongsi maklumat atau komen di Facebook...
                  </div>
                </div>

                {/* List of Facebook News Feed Posts */}
                {targetPosts.map((post) => {
                  const isLiked = !!likedPosts[post.id];

                  return (
                    <article
                      key={post.id}
                      className="bg-slate-900 border-y border-slate-800/80 p-3 sm:p-3.5 space-y-3 transition hover:bg-slate-900/95"
                    >
                      {/* Post Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-950 p-0.5 border border-yellow-400/60 overflow-hidden flex items-center justify-center flex-shrink-0">
                            <img
                              src={post.authorAvatar || pageAvatar}
                              alt={post.author}
                              className="w-full h-full object-contain rounded-full"
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1">
                              <h5 className="font-extrabold text-xs text-white leading-tight truncate">{post.author}</h5>
                              <CheckCircle2 className="w-3 h-3 text-blue-400 flex-shrink-0" />
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                              <span>{post.timeAgo}</span>
                              <span>•</span>
                              <Globe className="w-2.5 h-2.5" />
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 flex-shrink-0">
                          <a
                            href={post.postUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-slate-400 hover:text-white rounded-lg transition"
                            title="Buka Kiriman di Facebook"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                          <button
                            type="button"
                            onClick={() => handleShare(post)}
                            className="p-1 text-slate-400 hover:text-white rounded-lg transition"
                          >
                            <MoreHorizontal className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Post Content - Guaranteed 100% Full Text Visibility without clipping */}
                      <div className="text-[11px] sm:text-xs text-slate-200 leading-relaxed space-y-2 whitespace-pre-line break-words font-normal">
                        <p>{post.content}</p>
                      </div>

                      {/* Post Image with Zoom Preview */}
                      {post.imageUrl && (
                        <div
                          onClick={() => setSelectedImage({ url: post.imageUrl!, title: post.author })}
                          className="rounded-xl overflow-hidden bg-slate-950 border border-slate-800 relative group cursor-pointer"
                        >
                          <img
                            src={post.imageUrl}
                            alt="Foto Kiriman Facebook"
                            referrerPolicy="no-referrer"
                            className="w-full max-h-56 sm:max-h-64 object-cover group-hover:scale-105 transition duration-300"
                          />
                          <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 backdrop-blur-sm rounded-lg text-[9px] text-white font-bold opacity-0 group-hover:opacity-100 transition flex items-center gap-1">
                            <Eye className="w-3 h-3 text-yellow-300" />
                            <span>Klik untuk besarkan</span>
                          </div>
                        </div>
                      )}

                      {/* Reaction & Engagement Counter Bar */}
                      <div className="pt-2 flex items-center justify-between text-[10px] text-slate-400 border-b border-slate-800 pb-2">
                        <div className="flex items-center gap-1.5">
                          <div className="flex -space-x-1">
                            <span className="w-4 h-4 rounded-full bg-[#1877F2] text-white flex items-center justify-center text-[8px] font-bold shadow">
                              👍
                            </span>
                            <span className="w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[8px] font-bold shadow">
                              ❤️
                            </span>
                          </div>
                          <span className="font-semibold text-slate-300">{post.likesCount}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span>{post.commentsCount} komen</span>
                          <span>•</span>
                          <span>{post.sharesCount} kongsi</span>
                        </div>
                      </div>

                      {/* Action Buttons: Like, Comment, Share, Open FB */}
                      <div className="grid grid-cols-4 gap-1 pt-0.5">
                        {/* Like Button */}
                        <button
                          type="button"
                          onClick={() => handleToggleLike(post.id)}
                          className={`py-1.5 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition ${
                            isLiked
                              ? 'bg-blue-600/20 text-[#1877F2] font-black'
                              : 'text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          <ThumbsUp className={`w-3 h-3 ${isLiked ? 'fill-[#1877F2]' : ''}`} />
                          <span>{isLiked ? 'Disukai' : 'Suka'}</span>
                        </button>

                        {/* Comment Button */}
                        <a
                          href={post.postUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-1.5 rounded-lg text-[10px] font-bold text-slate-300 hover:bg-slate-800 flex items-center justify-center gap-1 transition"
                        >
                          <MessageCircle className="w-3 h-3" />
                          <span>Komen</span>
                        </a>

                        {/* Share Button */}
                        <button
                          type="button"
                          onClick={() => handleShare(post)}
                          className="py-1.5 rounded-lg text-[10px] font-bold text-slate-300 hover:bg-slate-800 flex items-center justify-center gap-1 transition"
                        >
                          <Share2 className="w-3 h-3" />
                          <span>Kongsi</span>
                        </button>

                        {/* Open Post on FB */}
                        <a
                          href={post.postUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-1.5 bg-blue-600/10 hover:bg-blue-600/30 text-blue-300 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 border border-blue-500/20 transition"
                        >
                          <span>FB</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>

            {/* Bottom Smartphone Home Indicator Swipe Bar */}
            <div className="bg-slate-950 py-1.5 sm:py-2 flex items-center justify-center flex-shrink-0 z-30">
              <div className="w-28 sm:w-32 h-1 bg-white/40 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-3 sm:p-6 lg:p-8 border border-white/20 shadow-2xl space-y-6">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-blue-600 text-white px-4 py-2.5 rounded-2xl shadow-2xl font-bold text-xs flex items-center gap-2 border border-blue-300 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-yellow-300" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-600/30 text-blue-300 font-bold rounded-full text-xs border border-blue-400/30">
            <Smartphone className="w-3.5 h-3.5 text-blue-300" />
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping"></span>
            <span>Feed Facebook HD (Dwi-Telefon Pintar)</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#1877F2] text-white flex items-center justify-center font-black text-lg shadow-md shadow-blue-600/30 flex-shrink-0">
              f
            </div>
            <span className="truncate">Feed Live Facebook SK Merbau Pulas & PPD KBB</span>
          </h3>
          <p className="text-xs text-slate-300 max-w-2xl">
            Paparan HD penuh responsif dalam kerangka dwi-telefon pintar. Seluruh ayat, gambar, dan pengumuman rasmi Facebook dibaca dengan lengkap tanpa terputus di mana-mana peranti.
          </p>
        </div>

        {/* Action Direct Links */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <a
            href="https://www.facebook.com/SKMPKBA5012/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow"
          >
            <span>FB SKMP</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <a
            href="https://www.facebook.com/p/PPD-Kulim-Bandar-Baharu-61553992422357/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 bg-[#1877F2] hover:bg-blue-500 text-white font-black rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow"
          >
            <span>FB PPD KBB</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Main Smartphone Showcase Area: Permanent Dual Smartphone */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center justify-center pt-2">
        <div className="space-y-3">
          <div className="text-center font-extrabold text-xs text-yellow-300 uppercase tracking-wider flex items-center justify-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
            <span>Telefon 1: SK Merbau Pulas Rasmi</span>
          </div>
          {renderPhoneMockup('skmp')}
        </div>

        <div className="space-y-3">
          <div className="text-center font-extrabold text-xs text-blue-300 uppercase tracking-wider flex items-center justify-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-400"></span>
            <span>Telefon 2: PPD Kulim Bandar Baharu</span>
          </div>
          {renderPhoneMockup('ppdkbb')}
        </div>
      </div>

      {/* Bottom Information Callout */}
      <div className="bg-blue-950/60 border border-blue-400/20 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-200">
        <div className="flex items-center gap-2.5 text-center sm:text-left">
          <Globe className="w-4 h-4 text-yellow-400 flex-shrink-0 hidden sm:inline" />
          <span>
            Buka terus ke aplikasi Facebook Rasmi untuk memberi komen, menyertai aktiviti sekolah, atau melihat album penuh gambar program.
          </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <a
            href="https://www.facebook.com/SKMPKBA5012/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow"
          >
            <span>Buka FB SKMP</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <a
            href="https://www.facebook.com/p/PPD-Kulim-Bandar-Baharu-61553992422357/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 bg-[#1877F2] hover:bg-blue-500 text-white font-black rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow"
          >
            <span>Buka FB PPD KBB</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Image Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md p-4 flex items-center justify-center animate-fadeIn"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="bg-slate-900 border border-white/20 rounded-3xl p-4 max-w-2xl w-full space-y-4 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h4 className="font-extrabold text-sm text-white truncate">{selectedImage.title}</h4>
              <button
                type="button"
                onClick={() => setSelectedImage(null)}
                className="p-1.5 bg-white/10 hover:bg-white/20 rounded-full text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="rounded-2xl overflow-hidden max-h-[70vh] bg-black flex items-center justify-center">
              <img
                src={selectedImage.url}
                alt=""
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedImage(null)}
                className="px-4 py-2 bg-yellow-400 text-blue-950 font-bold rounded-xl text-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
