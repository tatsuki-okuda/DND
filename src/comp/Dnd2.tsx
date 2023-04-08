import React, { cloneElement, useCallback, useEffect, useMemo, useRef, useState } from "react";

/**
 * 配列の要素を移動させる
 */
const moveItem = <T = any>( arr: T[], currentIndex: number, targetIndex: number) =>  {
  const cloneArr = [...arr];
  [cloneArr[currentIndex], cloneArr[targetIndex]] = [arr[targetIndex], arr[currentIndex]];
  return cloneArr;
};

export type Item = {
  id: string;
  name: string;
  username?: string;
  email?: string
};

type ItemProps = {
  key: string;
  ref: (elm: HTMLElement | null) => void;
  onDragEnter?: (event: React.DragEvent) => void;
  onDragOver?: (event: React.DragEvent) => void;
  onDragLeave?: (event: React.DragEvent) => void;
  onDrop?: (event: React.DragEvent) => void;
};

type HandleProps = {
  draggable: true;
  onDragStart?: (event: React.DragEvent) => void;
  onDragEnd?: (event: React.DragEvent) => void;
};

type ItemViewParams = {
  item: Item;
  index: () => number;
  handleProps: HandleProps;
  itemProps: ItemProps;
};

type GhostViewParams = {
  item: Item;
  ghostProps: Omit<ItemProps, "ref">;
};

type Props = {
  initItems: Item[];
  direction?: "vertical" | "horizontal";
  onChange?: (newItems: Item[]) => void;
  // ReactNodeではなくメソッドを受け取る
  // 必須にすることで何が必要か一目でわかる
  children: (params: ItemViewParams) => JSX.Element;
  ghost?: (params: GhostViewParams) => JSX.Element;
};

const initialIndex = -1;



/**
 * @function
 * @param {Props} { initItems, onChange } 
 * @returns {JSX.Element}
 */
const Dnd2 = ({
  initItems,
  direction = "vertical",
  onChange = () => {},
  children: itemViewFn,
  ghost: ghostView = () => <></>
}: Props):JSX.Element => {
  // リストデータ
  const [items, setItems] = useState(initItems);

  // リストのイメージ
  const $refs = useRef(new Map<string, HTMLElement>());

  // ドラッグ中のアイテム
  const [activeId, setActiveId] = useState<null | string>(null);
  const $activeId = useRef<typeof activeId>(null);

  // ドラッグ先のアイテム
  const [targetIndex, setTargetIndex] = useState(initialIndex);
  const $targetIndex = useRef(initialIndex);

  /**
   * refを受け取ってMapに格納する
   * @function
   * @param {string} id 
   * @param {HTMLElement | null} elm 
   * @returns {void}
   */
  const setElm = (id: string, elm: HTMLElement | null): void => {
    if (elm) {
      $refs.current.set(id, elm);
    } else {
      $refs.current.delete(id);
    }
  };


  /**
   * @function
   * @param {string | null} itemId 
   * @returns {number}
   */
  const getIndex = useCallback(
    (itemId: string | null): number => {
      return items.findIndex((item) => item.id === itemId);
    },
    [items]
  );


  /**
   * ドラッグを開始する要素に設定するpropsを生成する
   * @function
   * @param {Item} item 
   * @returns HandleProps
   */
  const getHandleProps = (item: Item): HandleProps => {
    return {
      draggable: true,
      onDragStart(event) {
        // activeIdの更新
        setActiveId(item.id);
        $activeId.current = item.id;

        // ドラッグデータの設定
        event.dataTransfer.setData("text/plain", item.id);
        event.dataTransfer.dropEffect = "move";
        event.dataTransfer.effectAllowed = "move";

        // ドラッグ時に表示される画像(要素)を設定
        const elm = $refs.current.get(item.id);
        if (elm) {
          const rect = elm.getBoundingClientRect(); //要素の寸法と、そのビューポートに対する相対位置
          const posX = event.clientX - rect.left;
          const posY = event.clientY - rect.top;
          event.dataTransfer.setDragImage(elm, posX, posY);
        }
      },
      onDragEnd(event) {
        // ドラッグスタートした時のidとエンドの時のidが一致するか
        if ($activeId.current === item.id) {
          const activeIndex = getIndex(item.id);
          // 有効なindexの範囲なら置き換える
          if (activeIndex >= 0 && $targetIndex.current >= 0) {
            const newItems = moveItem(items, activeIndex, $targetIndex.current);
            setItems(newItems);
            onChange(newItems);
          }
        }
        // 各データを初期化する
        setActiveId(null);
        $activeId.current = null;
        setTargetIndex(initialIndex);
        $targetIndex.current = initialIndex;
      }
    };
  };


  /**
   * ドラッグ先の要素に設定するpropsを生成する
   * @function
   * @param {Item} item 
   * @returns {ItemProps}
   */
  const getItemProps = (item: Item): ItemProps => {
    return {
      key: item.id,
      ref: (elm) => setElm(item.id, elm),
      onDragEnter(event) {
        event.preventDefault();
      },
      onDragLeave(event) {
        event.preventDefault();
      },
      onDrop(event) {
        event.preventDefault();
      },
      onDragOver(event) {
        event.preventDefault();
        const elm = $refs.current.get(item.id);
        const i = getIndex(item.id);
        // HTMLElementの存在確認
        if (!elm || i < 0) return;

        // カーソル位置に応じてtargetIndexを更新する
        const rect = elm.getBoundingClientRect();
        const posX = event.clientX - rect.left;
        const posY = event.clientY - rect.top;
        const ratioX = Math.min(1, Math.max(0, posX / rect.width));
        const ratioY = Math.min(1, Math.max(0, posY / rect.height));
        const shift = Math.round(direction === "vertical" ? ratioY : ratioX);
        setTargetIndex(i + shift);
        $targetIndex.current = i + shift;
      }
    };
  };


  /**
   * getGhostProps
   * @function
   * @returns {GhostViewParams}
   */
  const getGhostProps = (): GhostViewParams["ghostProps"] => {
    return {
      key: "__ghost__",
      onDragEnter(event) {
        event.preventDefault();
      },
      onDragLeave(event) {
        event.preventDefault();
      },
      onDrop(event) {
        event.preventDefault();
      },
      onDragOver(event) {
        event.preventDefault();
      }
    };
  };

  /**
   * JSX.Elementをメモ化して再レンダリングと計算を抑える
   */
  const views = useMemo(() => {
    return items.map((item) => {
      return itemViewFn({
        item,
        index: () => items.findIndex((target) => target.id === item.id),
        handleProps: getHandleProps(item),
        itemProps: getItemProps(item)
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, itemViewFn]);


  /**
   * JSX.Elementの再生成を抑えて再レンダリングと計算を抑える目的
   * 生成済みのviews(JSX.Element[])にゴーストやその他の情報を付与する
   */
  const viewsWithGhost = useMemo(() => {
    const activeIndex = getIndex(activeId);
    return views.flatMap((view, i): JSX.Element[] => {
      if (i === activeIndex) {
        // activeIndexだったらクローンを作成して属性値を付与
        const viewWithAttr = cloneElement(view, {
          "data-active": true
        });
        return [viewWithAttr];
      }

      if (i === targetIndex) {
        // targetIndexだったらクローンを作成して属性値を付与
        const viewWithAttr = cloneElement(view, {
          "data-target": true
        });

        if (i - activeIndex >= 2 || i - activeIndex < 0) {
          // 移動可能な位置ならゴーストと一緒に返す
          const ghost = ghostView({
            item: items[activeIndex],
            ghostProps: getGhostProps()
          });
          return [ghost, viewWithAttr];
        }
        return [viewWithAttr];
      }

      if (i + 1 === items.length && i + 1 === targetIndex) {
        // targetIndexが末尾ならゴーストと一緒に返す
        const ghost = ghostView({
          item: items[activeIndex],
          ghostProps: getGhostProps()
        });
        return [view, ghost];
      }

      // 通常アイテムならそのままviewを返す
      return [view];
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [views, ghostView, activeId, targetIndex]);



  useEffect(() => {
    setItems([...initItems]);
  }, [initItems]);



  return (
    <>
      {viewsWithGhost}
    </>
  )
}

export default Dnd2